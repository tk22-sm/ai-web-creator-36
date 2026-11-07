/**
 * lib/csp.mjs のテスト（D-059）。実行：npm test
 * HTML の例は、Next.js 16.4.3 の静的書き出しの構造（インラインスクリプト3種・外部スクリプト・next/image の style）をまねている。
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, test } from "node:test";
import {
  ALLOWED_STYLE_ATTRIBUTE_VALUES,
  CspBuildError,
  HEADERS_MAX_LINE_LENGTH,
  analyzeHtml,
  assertSafeCsp,
  buildCsp,
  collectHashes,
  countRules,
  cspHash,
  decodeAttributeValue,
  parseAttributes,
  renderHeadersFile,
  verifyHeadersFile,
} from "./csp.mjs";

const TURBOPACK = '(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push({"otherChunks":["static/chunks/a.js"]});';
const NEXT_F_INIT = "(self.__next_f=self.__next_f||[]).push([0])";
const nextData = (text) => `self.__next_f.push([1,"${text}\\n"])`;

/** Next.js の出力をまねた HTML を作る */
function page({ body = "<main><h1>Title</h1></main>", data = "page", head = "", extraScripts = "" } = {}) {
  return (
    '<!DOCTYPE html><html lang="ja"><head><meta charSet="utf-8"/>' +
    '<link rel="stylesheet" href="/_next/static/chunks/x.css" data-precedence="next"/>' +
    '<link rel="preload" as="script" fetchPriority="low" href="/_next/static/chunks/a.js"/>' +
    '<script src="/_next/static/chunks/a.js" async=""></script>' +
    '<script src="/_next/static/chunks/polyfill.js" noModule=""></script>' +
    `${head}<link rel="icon" href="/favicon.ico?favicon.1.ico" sizes="256x256" type="image/x-icon"/></head>` +
    `<body>${body}<!--$--><!--/$-->` +
    `<script id="_R_">${TURBOPACK}</script><script>${NEXT_F_INIT}</script><script>${nextData(data)}</script>${extraScripts}` +
    "</body></html>"
  );
}

const expectFail = (fn, pattern) =>
  assert.throws(fn, (error) => error instanceof CspBuildError && pattern.test(error.message));

describe("cspHash", () => {
  test("SHA-256 を base64 にして 'sha256-…' の形にする", () => {
    const expected = createHash("sha256").update("alert(1)", "utf8").digest("base64");
    assert.equal(cspHash("alert(1)"), `'sha256-${expected}'`);
  });
  test("日本語・改行も UTF-8 のまま計算する（空白を変えると別の値になる）", () => {
    assert.equal(cspHash("あ\n"), `'sha256-${createHash("sha256").update(Buffer.from("あ\n", "utf8")).digest("base64")}'`);
    assert.notEqual(cspHash("a b"), cspHash("a  b"));
  });
});

describe("decodeAttributeValue", () => {
  test("React が出力する文字参照を戻す", () => {
    assert.equal(decodeAttributeValue("a&amp;b&quot;c&#x27;d&lt;e&gt;f&#39;"), "a&b\"c'd<e>f'");
  });
  test("&amp;lt; は & と lt; に戻す（二重に戻さない）", () => {
    assert.equal(decodeAttributeValue("&amp;lt;"), "&lt;");
  });
  test("想定外の文字参照は null", () => {
    assert.equal(decodeAttributeValue("&#106;avascript:"), null);
    assert.equal(decodeAttributeValue("a & b"), null);
  });
});

describe("parseAttributes", () => {
  test("引用符付きの値と、値なしの属性を読む", () => {
    assert.deepEqual([...parseAttributes(' src="/a.js" async=""').entries()], [["src", "/a.js"], ["async", ""]]);
    assert.deepEqual([...parseAttributes(" defer").entries()], [["defer", ""]]);
    assert.equal(parseAttributes("").size, 0);
  });
  test("引用符なし・単引用符・重複は読み取れないものとして null", () => {
    assert.equal(parseAttributes(" src=/a.js"), null);
    assert.equal(parseAttributes(" src='/a.js'"), null);
    assert.equal(parseAttributes(' id="a" id="b"'), null);
  });
});

describe("analyzeHtml：正常な出力", () => {
  test("インラインスクリプト3種・外部スクリプト・style 属性を取り出す", () => {
    const result = analyzeHtml(page({ body: '<img alt="作品" src="/images/a.webp" style="color:transparent"/>' }), "index.html");
    assert.deepEqual(result.inlineScripts, [TURBOPACK, NEXT_F_INIT, nextData("page")]);
    assert.deepEqual(result.externalScripts, ["/_next/static/chunks/a.js", "/_next/static/chunks/polyfill.js"]);
    assert.deepEqual(result.styleAttributes, ["color:transparent"]);
  });
  test("外部サイトへの通常のリンク（a 要素）は許可する", () => {
    assert.doesNotThrow(() => analyzeHtml(page({ body: '<a href="https://example.com/" target="_blank" rel="noopener noreferrer">外部</a>' }), "a.html"));
  });
  test("本文中の文字列としての onclick= や <script（文字参照）は問題にしない", () => {
    assert.doesNotThrow(() => analyzeHtml(page({ body: "<p>onclick=&quot;x&quot; と &lt;script&gt; の説明</p>" }), "a.html"));
  });
});

describe("analyzeHtml：想定外の構造ではビルドを止める", () => {
  const cases = [
    ["DOCTYPE が無い", page().replace("<!DOCTYPE html>", ""), /DOCTYPE/],
    ["終了タグの無い <script>", page({ extraScripts: "<script>self.__next_f.push(1)" }), /一致しません/],
    ["想定外のインラインスクリプト", page({ extraScripts: "<script>alert(1)</script>" }), /想定外のインラインスクリプト/],
    ["中身が空のインラインスクリプト", page({ extraScripts: "<script></script>" }), /空/],
    ["インラインスクリプトの type 属性", page({ extraScripts: `<script type="module">${NEXT_F_INIT}</script>` }), /想定外の属性（type）/],
    ["外部サイトのスクリプト", page({ extraScripts: '<script src="https://cdn.example.com/a.js"></script>' }), /サイト外/],
    ["プロトコル省略の外部スクリプト", page({ extraScripts: '<script src="//cdn.example.com/a.js"></script>' }), /サイト外/],
    ["_next/static 以外のスクリプト", page({ extraScripts: '<script src="/other/a.js"></script>' }), /サイト外/],
    ["外部スクリプトの想定外の属性", page({ extraScripts: '<script src="/_next/static/chunks/b.js" crossorigin=""></script>' }), /想定外の属性（crossorigin）/],
    ["src 付きなのに中身がある", page({ extraScripts: `<script src="/_next/static/chunks/b.js">${NEXT_F_INIT}</script>` }), /中身があります/],
    ["スクリプト内の <!--", page({ data: "<!--x" }), /<!--/],
    ["引用符なしの属性", page({ extraScripts: `<script id=_R_>${NEXT_F_INIT}</script>` }), /属性を読み取れません/],
    ["<style> タグ", page({ head: "<style>body{color:red}</style>" }), /<style>/],
    ["<iframe>", page({ body: '<iframe src="/a.html"></iframe>' }), /<iframe>/],
    ["<base>", page({ head: '<base href="/"/>' }), /<base>/],
    ["<meta http-equiv>", page({ head: '<meta http-equiv="refresh" content="0"/>' }), /http-equiv/],
    ["イベント属性", page({ body: '<button onclick="x()">x</button>' }), /イベント属性/],
    ["javascript: のリンク", page({ body: '<a href="javascript:alert(1)">x</a>' }), /javascript:/],
    ["文字参照で隠した javascript:", page({ body: '<a href="&#106;avascript:alert(1)">x</a>' }), /読み取れません/],
    ["外部の画像", page({ body: '<img alt="" src="https://example.com/a.png"/>' }), /外部のファイル/],
    ["外部の画像（srcset）", page({ body: '<img alt="" src="/a.png" srcset="/a.png 1x, https://example.com/b.png 2x"/>' }), /外部のファイル/],
    ["外部のスタイルシート", page({ head: '<link rel="stylesheet" href="https://example.com/a.css"/>' }), /外部のファイル/],
    ["許可していない style 属性", page({ body: '<div style="color:red"></div>' }), /style 属性/],
    ["引用符なしの style 属性", page({ body: "<div style=color:transparent></div>" }), /style 属性/],
    ["タグの区切りが読めない", page({ body: '<div title="a<b"></div>' }), /区切り/],
    ["インラインスクリプトが1つも無い", '<!DOCTYPE html><html><body><script src="/_next/static/chunks/a.js"></script></body></html>', /1つもありません/],
  ];
  for (const [name, html, pattern] of cases) {
    test(name, () => expectFail(() => analyzeHtml(html, "bad.html"), pattern));
  }
  test("エラー文にファイル名を含め、HTML の中身は含めない", () => {
    try {
      analyzeHtml(page({ extraScripts: "<script>secret_value_123</script>" }), "contact.html");
      assert.fail("止まるはず");
    } catch (error) {
      assert.match(error.message, /^contact\.html：/);
      assert.doesNotMatch(error.message, /secret_value_123/);
    }
  });
});

describe("collectHashes・buildCsp", () => {
  const analyses = [
    analyzeHtml(page({ data: "a", body: '<img alt="" src="/a.webp" style="color:transparent"/>' }), "a.html"),
    analyzeHtml(page({ data: "b" }), "b.html"),
  ];
  test("ページ間で同じスクリプトは1つにまとめ、並び順を一定にする", () => {
    const { scriptHashes, styleHashes } = collectHashes(analyses);
    assert.equal(scriptHashes.length, 4); // 共通2種＋ページごとのデータ2種
    assert.deepEqual(scriptHashes, [...scriptHashes].sort());
    assert.deepEqual(styleHashes, [cspHash("color:transparent")]);
    assert.deepEqual(collectHashes([...analyses].reverse()), collectHashes(analyses));
  });
  test("承認された構成の CSP を作る", () => {
    const hashes = collectHashes(analyses);
    const csp = buildCsp(hashes);
    const directives = Object.fromEntries(csp.split("; ").map((d) => [d.split(" ")[0], d.split(" ").slice(1)]));
    assert.deepEqual(directives["default-src"], ["'none'"]);
    assert.deepEqual(directives["script-src"], ["'self'", ...hashes.scriptHashes]);
    assert.deepEqual(directives["style-src"], ["'self'", "'unsafe-hashes'", cspHash("color:transparent")]);
    assert.deepEqual(directives["connect-src"], ["'self'", "https://formspree.io/f/"]);
    assert.deepEqual(directives["form-action"], ["'none'"]);
    assert.deepEqual(directives["frame-ancestors"], ["'none'"]);
    assert.deepEqual(directives["object-src"], ["'none'"]);
    assert.deepEqual(directives["base-uri"], ["'none'"]);
    assert.deepEqual(directives["img-src"], ["'self'"]);
    assert.ok("upgrade-insecure-requests" in directives);
    assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
  });
  test("style 属性が無ければ 'unsafe-hashes' を付けない", () => {
    const csp = buildCsp(collectHashes([analyses[1]]));
    assert.match(csp, /style-src 'self';/);
    assert.doesNotMatch(csp, /unsafe-hashes/);
  });
  test("ハッシュが無い・形式が不正なら止める", () => {
    expectFail(() => buildCsp({ scriptHashes: [], styleHashes: [] }), /ハッシュがありません/);
    expectFail(() => buildCsp({ scriptHashes: ["'unsafe-inline'"], styleHashes: [] }), /形式/);
  });
  test("使ってはいけない値を検出する", () => {
    for (const bad of ["'unsafe-inline'", "'unsafe-eval'", "'strict-dynamic'", "*", "data:", "http:"]) {
      expectFail(() => assertSafeCsp(`default-src 'none'; script-src 'self' ${bad}`), /使ってはいけない値/);
    }
    expectFail(() => assertSafeCsp("default-src 'none'; script-src 'self' https://example.com"), /'self' とハッシュ以外/);
    expectFail(() => assertSafeCsp("default-src 'none'"), /script-src がありません/);
  });
  test("許可する style 属性は color:transparent だけ", () => {
    assert.deepEqual([...ALLOWED_STYLE_ATTRIBUTE_VALUES], ["color:transparent"]);
  });
});

describe("renderHeadersFile・verifyHeadersFile", () => {
  const pages = [
    { file: "index.html", html: page({ data: "index", body: '<img alt="" src="/a.webp" style="color:transparent"/>' }) },
    { file: "404.html", html: page({ data: "404" }) },
  ];
  const text = renderHeadersFile(buildCsp(collectHashes(pages.map((p) => analyzeHtml(p.html, p.file)))));

  test("/* のルール1つに、CSP と他のセキュリティヘッダーを書く", () => {
    assert.equal(countRules(text), 1);
    const lines = text.split("\n");
    assert.ok(lines.includes("/*"));
    assert.ok(lines.some((l) => l.startsWith("  Content-Security-Policy: default-src 'none'; ")));
    assert.ok(lines.includes("  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()"));
    assert.ok(lines.includes("  X-Frame-Options: DENY"));
    assert.ok(lines.includes("  Cross-Origin-Opener-Policy: same-origin"));
    // Cloudflare の既定値と重複させない（既定値に任せる）
    assert.ok(!lines.some((l) => /Referrer-Policy|X-Content-Type-Options/.test(l)));
  });
  test("今のビルド結果と一致すれば通る", () => {
    assert.doesNotThrow(() => verifyHeadersFile(text, pages));
  });
  test("ビルド結果が変わった（古いハッシュ）なら止める", () => {
    const rebuilt = [{ ...pages[0], html: page({ data: "index-v2", body: '<img alt="" src="/a.webp" style="color:transparent"/>' }) }, pages[1]];
    expectFail(() => verifyHeadersFile(text, rebuilt), /一致しません/);
  });
  test("ページが増えた・減ったなら止める", () => {
    expectFail(() => verifyHeadersFile(text, [...pages, { file: "new.html", html: page({ data: "new" }) }]), /一致しません/);
    expectFail(() => verifyHeadersFile(text, [pages[0]]), /一致しません/);
  });
  test("手で書き換えられた・ルールが増えた・CSP が重複したなら止める", () => {
    expectFail(() => verifyHeadersFile(text.replace("'self'", "'self' 'unsafe-inline'"), pages), /使ってはいけない値/);
    expectFail(() => verifyHeadersFile(`${text}\n/about\n  X-Test: 1\n`, pages), /ルールが1つではありません/);
    expectFail(() => verifyHeadersFile(text.replace("/*\n", "/about\n"), pages), /\/\* ではありません/);
    const csp = text.split("\n").find((l) => l.includes("Content-Security-Policy"));
    expectFail(() => verifyHeadersFile(`${text}${csp}\n`, pages), /1つではありません/);
    expectFail(() => verifyHeadersFile(text.replace("X-Frame-Options: DENY", "X-Frame-Options: SAMEORIGIN"), pages), /X-Frame-Options/);
  });
  test("1行が 2,000 文字を超えるなら止める（ページが増えすぎた場合）", () => {
    const many = Array.from({ length: 40 }, (_, i) => cspHash(`script-${i}`)).sort();
    const csp = buildCsp({ scriptHashes: many, styleHashes: [] });
    assert.ok(`  Content-Security-Policy: ${csp}`.length > HEADERS_MAX_LINE_LENGTH);
    expectFail(() => renderHeadersFile(csp), /2000 文字を超えます/);
  });
  test("ルールの数え方：コメント・空行・ヘッダー行は数えない", () => {
    assert.equal(countRules("# c\n/*\n  A: 1\n\n/x\n\tB: 2\n"), 2);
  });
});
