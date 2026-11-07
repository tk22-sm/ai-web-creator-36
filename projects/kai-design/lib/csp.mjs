/**
 * CSP（Content Security Policy）とセキュリティヘッダーを、ビルド結果の HTML から作る処理（D-059）。
 *
 * 方式A：out/ の全 HTML からインラインスクリプトの SHA-256 ハッシュを集め、全ページ共通の CSP を
 * Cloudflare Pages の `_headers`（`/*` のルール1つ）に書き出す。
 * ハッシュはビルドのたびに変わるため、ビルドのたびに必ず作り直す（scripts/generate-security-headers.mjs）。
 *
 * 安全側に倒す方針：HTML の構造が想定（Next.js 16.4.3 の静的書き出し）と違う場合は、推測で続けずに
 * CspBuildError を投げてビルドを止める。止めずに進めると、CSP が壊れて画面が動かなくなるか、
 * 本来止めるべきものを許可してしまうため。
 *
 * このファイルは Node.js の標準機能（node:crypto）だけを使う JavaScript にしている。
 * ビルド時（Cloudflare のビルド環境を含む）に、TypeScript の読み込み機能の有無に左右されずに動かすため。
 * HTML の読み取りは正規表現で行う。Next.js（React）が出力する HTML は、属性値の `<` `>` `"` などが
 * 必ず文字参照に置き換えられるため、タグの区切りを正規表現で確実に見分けられる。この前提が崩れた場合も
 * 整合性の検査で検出してビルドを止める。
 */
import { createHash } from "node:crypto";

/** `_headers` の制限（Cloudflare 公式：ルールは最大100、1行2,000文字。行全体を数える） */
export const HEADERS_MAX_RULES = 100;
export const HEADERS_MAX_LINE_LENGTH = 2000;

/** CSP を付ける URL の範囲。404 や _next/ の中のファイルも含め、すべての応答に付ける */
export const HEADERS_RULE_PATH = "/*";

/**
 * 許可する style 属性の値。next/image が `<img>` に付ける `color:transparent` だけ
 * （画像の読み込み前・失敗時に代替テキストを見せないためのもの）。これ以外が見つかったらビルドを止める。
 */
export const ALLOWED_STYLE_ATTRIBUTE_VALUES = Object.freeze(["color:transparent"]);

/**
 * インラインスクリプトとして想定する内容の書き出し。Next.js の静的書き出しが出力する3種類だけ。
 * - Turbopack のチャンク読み込みの設定（`<script id="_R_">`）
 * - RSC（React Server Components）データの受け皿の初期化
 * - RSC データ本体
 * これ以外が見つかったら、Next.js の更新などで構造が変わったものとしてビルドを止める。
 */
export const KNOWN_INLINE_SCRIPT_PREFIXES = Object.freeze([
  '(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(',
  "(self.__next_f=self.__next_f||[]).push(",
  "self.__next_f.push(",
]);

/** 外部ファイルを読み込む `<script>` に付いてよい属性 */
const EXTERNAL_SCRIPT_ATTRIBUTES = new Set(["src", "async", "nomodule"]);
/** インラインの `<script>` に付いてよい属性 */
const INLINE_SCRIPT_ATTRIBUTES = new Set(["id"]);
/** 外部スクリプトの読み込み元として許可するパス（同じサイトの Next.js の出力だけ） */
const EXTERNAL_SCRIPT_PATH = /^\/_next\/static\/[A-Za-z0-9._\-/~]+\.js$/;
/** 出力されていたら、想定外の構造としてビルドを止めるタグ */
const FORBIDDEN_TAGS = ["style", "iframe", "object", "embed", "base", "frame", "frameset", "applet"];

/** CSP の各項目。ハッシュ以外はここで固定し、ビルド結果によって変わらない */
export const CONNECT_SRC = Object.freeze(["'self'", "https://formspree.io/f/"]);

/** CSP 以外のセキュリティヘッダー（Referrer-Policy・X-Content-Type-Options は Cloudflare の既定値に任せる） */
export const OTHER_SECURITY_HEADERS = Object.freeze([
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()"],
  ["X-Frame-Options", "DENY"],
  ["Cross-Origin-Opener-Policy", "same-origin"],
]);

/** CSP に入っていてはいけない値 */
const FORBIDDEN_CSP_KEYWORDS = ["'unsafe-inline'", "'unsafe-eval'", "'strict-dynamic'", "'wasm-unsafe-eval'", "*", "data:", "blob:", "http:"];

/** ビルドを止めるためのエラー。メッセージには入力値やハッシュ値を含めない */
export class CspBuildError extends Error {
  /**
   * @param {string} message 日本語の説明
   * @param {string} [file] 問題が見つかったファイル（ビルド結果の中の相対パス）
   */
  constructor(message, file) {
    super(file ? `${file}：${message}` : message);
    this.name = "CspBuildError";
    this.file = file;
  }
}

/**
 * 文字列の SHA-256 ハッシュを、CSP に書く形（'sha256-…'）にする。
 * ブラウザは UTF-8 にした内容そのものをハッシュにするため、改行や空白も含めてそのまま計算する。
 *
 * @param {string} text インラインスクリプトの中身、または style 属性の値
 * @returns {string}
 */
export function cspHash(text) {
  return `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;
}

/**
 * HTML の文字参照を、属性値として必要な範囲で元の文字に戻す。
 * React が出力する5種類（&amp; &quot; &#x27; &lt; &gt;）と &#39; だけを扱い、それ以外の「&」が残る値は
 * 想定外として null を返す（呼び出し側でビルドを止める）。
 *
 * @param {string} value
 * @returns {string | null}
 */
export function decodeAttributeValue(value) {
  const decoded = value.replace(/&(amp|quot|lt|gt|#x27|#39);/g, (_, name) =>
    ({ amp: "\u0000AMP\u0000", quot: '"', lt: "<", gt: ">", "#x27": "'", "#39": "'" })[name],
  );
  if (decoded.includes("&")) return null;
  return decoded.replaceAll("\u0000AMP\u0000", "&");
}

/**
 * タグの属性部分を読み取る。値は引用符（"）付きか、値なし（async など）だけを受け付ける。
 *
 * @param {string} source `<script` の後ろから `>` の前まで
 * @returns {Map<string, string> | null} 属性名（小文字）→ 値。読み取れない書き方なら null
 */
export function parseAttributes(source) {
  const attributes = new Map();
  const pattern = /\s+([A-Za-z_:][A-Za-z0-9_:.-]*)(?:="([^"<>]*)")?/gy;
  let index = 0;
  while (index < source.length) {
    pattern.lastIndex = index;
    const match = pattern.exec(source);
    if (!match) {
      // 末尾の空白と「/」（自己終了の書き方）だけは許す
      if (/^\s*\/?\s*$/.test(source.slice(index))) break;
      return null;
    }
    const name = match[1].toLowerCase();
    if (attributes.has(name)) return null;
    attributes.set(name, match[2] ?? "");
    index = pattern.lastIndex;
  }
  return attributes;
}

/**
 * 1つの HTML から、CSP に必要な情報を取り出し、想定外の構造が無いかを確認する。
 *
 * @param {string} html HTML の中身
 * @param {string} file エラー表示用のファイル名
 * @returns {{ inlineScripts: string[], styleAttributes: string[], externalScripts: string[] }}
 * @throws {CspBuildError} 想定外の構造が見つかった場合
 */
export function analyzeHtml(html, file) {
  const fail = (message) => {
    throw new CspBuildError(message, file);
  };

  if (!/^<!DOCTYPE html>/i.test(html)) fail("HTML の先頭に <!DOCTYPE html> がありません");

  // 1. <script> を1つずつ取り出す。開始タグの数と、取り出せた数が一致することを確認する
  const openCount = (html.match(/<script\b/gi) ?? []).length;
  const closeCount = (html.match(/<\/script\s*>/gi) ?? []).length;
  if (openCount !== closeCount) fail(`<script> の開始タグ（${openCount}）と終了タグ（${closeCount}）の数が一致しません`);

  const inlineScripts = [];
  const externalScripts = [];
  const scriptPattern = /<script\b([^<>]*)>([\s\S]*?)<\/script\s*>/gi;
  let extracted = 0;
  let rest = "";
  let last = 0;
  for (const match of html.matchAll(scriptPattern)) {
    extracted += 1;
    rest += html.slice(last, match.index);
    last = match.index + match[0].length;

    const attributes = parseAttributes(match[1]);
    if (!attributes) fail("<script> の属性を読み取れません");
    const content = match[2];
    if (/<script\b|<!--|<\/script/i.test(content)) fail("<script> の中に <script> または <!-- が含まれています");

    if (attributes.has("src")) {
      for (const name of attributes.keys()) {
        if (!EXTERNAL_SCRIPT_ATTRIBUTES.has(name)) fail(`外部スクリプトに想定外の属性（${name}）があります`);
      }
      if (content !== "") fail("src 付きの <script> に中身があります");
      const src = decodeAttributeValue(attributes.get("src"));
      if (src === null || !EXTERNAL_SCRIPT_PATH.test(src)) fail("サイト外、または想定外の場所のスクリプトを読み込んでいます");
      externalScripts.push(src);
    } else {
      for (const name of attributes.keys()) {
        if (!INLINE_SCRIPT_ATTRIBUTES.has(name)) fail(`インラインスクリプトに想定外の属性（${name}）があります`);
      }
      if (content.trim() === "") fail("中身が空のインラインスクリプトがあります");
      if (!KNOWN_INLINE_SCRIPT_PREFIXES.some((prefix) => content.startsWith(prefix))) {
        fail("想定外のインラインスクリプトがあります（Next.js の更新などで出力の構造が変わった可能性）");
      }
      inlineScripts.push(content);
    }
  }
  rest += html.slice(last);
  if (extracted !== openCount) fail(`<script> を ${openCount} 個中 ${extracted} 個しか取り出せません`);
  if (inlineScripts.length === 0) fail("インラインスクリプトが1つもありません（想定外の出力）");

  // 2. スクリプトを除いた残りのタグを確認する（タグの中に < が無いこと＝区切りを正しく読めていること）
  const tags = rest.match(/<[A-Za-z][^>]*>/g) ?? [];
  const styleAttributes = [];
  for (const tag of tags) {
    if (tag.slice(1).includes("<")) fail("タグの区切りを読み取れません");
    const tagName = /^<([A-Za-z][A-Za-z0-9-]*)/.exec(tag)[1].toLowerCase();
    if (FORBIDDEN_TAGS.includes(tagName)) fail(`想定外のタグ（<${tagName}>）があります`);
    if (tagName === "meta" && /\shttp-equiv\s*=/i.test(tag)) fail("<meta http-equiv> があります");
    if (/\son[a-z]+\s*=/i.test(tag)) fail("インラインのイベント属性（onclick など）があります");

    for (const match of tag.matchAll(/\s(href|src|action|formaction|srcset|poster|data)\s*=\s*"([^"]*)"/gi)) {
      const value = decodeAttributeValue(match[2]);
      if (value === null) fail(`${match[1]} 属性の値を読み取れません`);
      if (/^\s*(javascript|vbscript|data):/i.test(value)) fail(`${match[1]} 属性に javascript: などが使われています`);
      const name = match[1].toLowerCase();
      // 画面の中に読み込む（a 要素のリンク以外の）外部ファイルは CSP で止まるため、出力の時点で検出する
      const isNavigation = name === "href" && (tagName === "a" || (tagName === "link" && /\srel="(canonical|alternate)"/i.test(tag)));
      const external = name === "srcset" ? /(^|[\s,])(https?:)?\/\//i.test(value) : /^\s*(https?:)?\/\//i.test(value);
      if (!isNavigation && external) fail(`外部のファイルを読み込んでいます（<${tagName} ${name}>）`);
    }

    for (const match of tag.matchAll(/\sstyle\s*=\s*("([^"]*)"|'[^']*'|[^\s>]+)/gi)) {
      if (match[2] === undefined) fail("style 属性の書き方が想定外です");
      const value = decodeAttributeValue(match[2]);
      if (value === null || !ALLOWED_STYLE_ATTRIBUTE_VALUES.includes(value)) fail("許可していない style 属性があります");
      styleAttributes.push(value);
    }
  }
  // <style> は開始タグの確認で止めるが、念のため終了タグも確認する
  if (/<\/style\s*>/i.test(rest)) fail("<style> があります");

  return { inlineScripts, styleAttributes, externalScripts };
}

/**
 * 全ページの読み取り結果から、重複を除いて並べたハッシュの一覧を作る（並び順を一定にし、差分を見やすくする）。
 *
 * @param {Array<{ inlineScripts: string[], styleAttributes: string[] }>} analyses
 * @returns {{ scriptHashes: string[], styleHashes: string[] }}
 */
export function collectHashes(analyses) {
  const scriptHashes = new Set();
  const styleHashes = new Set();
  for (const { inlineScripts, styleAttributes } of analyses) {
    for (const script of inlineScripts) scriptHashes.add(cspHash(script));
    for (const style of styleAttributes) styleHashes.add(cspHash(style));
  }
  return { scriptHashes: [...scriptHashes].sort(), styleHashes: [...styleHashes].sort() };
}

/**
 * CSP の値を組み立てる。
 *
 * @param {{ scriptHashes: string[], styleHashes: string[] }} hashes
 * @returns {string}
 */
export function buildCsp({ scriptHashes, styleHashes }) {
  if (scriptHashes.length === 0) throw new CspBuildError("インラインスクリプトのハッシュがありません");
  const isHash = (h) => /^'sha256-[A-Za-z0-9+/]{43}='$/.test(h);
  if (![...scriptHashes, ...styleHashes].every(isHash)) throw new CspBuildError("ハッシュの形式が正しくありません");

  const directives = [
    ["default-src", ["'none'"]],
    ["script-src", ["'self'", ...scriptHashes]],
    // style 属性のハッシュは 'unsafe-hashes' が無いと使えない（CSP Level 3）。許可する値が無ければ付けない
    ["style-src", styleHashes.length > 0 ? ["'self'", "'unsafe-hashes'", ...styleHashes] : ["'self'"]],
    ["img-src", ["'self'"]],
    ["font-src", ["'self'"]],
    ["connect-src", [...CONNECT_SRC]],
    ["manifest-src", ["'self'"]],
    ["base-uri", ["'none'"]],
    // フォームの通常の送信（ページ移動）はすべて止める。送信は JavaScript（fetch）で行い、connect-src で制限する
    ["form-action", ["'none'"]],
    ["frame-ancestors", ["'none'"]],
    ["object-src", ["'none'"]],
    ["upgrade-insecure-requests", []],
  ];
  const csp = directives.map(([name, values]) => [name, ...values].join(" ")).join("; ");
  assertSafeCsp(csp);
  return csp;
}

/**
 * 組み立てた CSP に、使ってはいけない値が無いことを確認する。
 *
 * @param {string} csp
 */
export function assertSafeCsp(csp) {
  const tokens = csp.split(/[\s;]+/).filter(Boolean);
  for (const keyword of FORBIDDEN_CSP_KEYWORDS) {
    if (tokens.includes(keyword)) throw new CspBuildError(`CSP に使ってはいけない値（${keyword}）が含まれています`);
  }
  const scriptSrc = csp.split(";").map((d) => d.trim()).find((d) => d.startsWith("script-src "));
  if (!scriptSrc) throw new CspBuildError("CSP に script-src がありません");
  const allowedScript = scriptSrc.split(/\s+/).slice(1).every((v) => v === "'self'" || /^'sha256-[A-Za-z0-9+/]{43}='$/.test(v));
  if (!allowedScript) throw new CspBuildError("script-src に 'self' とハッシュ以外の値があります");
}

/**
 * `_headers` の中身を作る。
 *
 * @param {string} csp
 * @returns {string}
 */
export function renderHeadersFile(csp) {
  const lines = [
    // コメントは ASCII だけにする（Cloudflare の解析で日本語のコメントが問題にならないことを確認できていないため）
    "# Generated at build time by scripts/generate-security-headers.mjs (D-059). Do not edit by hand.",
    "# Script hashes change on every build, so this file must be regenerated together with the build output.",
    HEADERS_RULE_PATH,
    `  Content-Security-Policy: ${csp}`,
    ...OTHER_SECURITY_HEADERS.map(([name, value]) => `  ${name}: ${value}`),
    "",
  ];
  const text = lines.join("\n");
  for (const line of text.split("\n")) {
    if (line.length > HEADERS_MAX_LINE_LENGTH) {
      throw new CspBuildError(`_headers の1行が ${HEADERS_MAX_LINE_LENGTH} 文字を超えます（${line.length} 文字）。ページが増えすぎた可能性があります`);
    }
  }
  if (countRules(text) > HEADERS_MAX_RULES) throw new CspBuildError(`_headers のルールが ${HEADERS_MAX_RULES} 個を超えます`);
  return text;
}

/**
 * `_headers` のルール（URL の行）の数を数える。コメント・空行・字下げされたヘッダー行は数えない。
 *
 * @param {string} text
 * @returns {number}
 */
export function countRules(text) {
  return text.split("\n").filter((line) => line.trim() !== "" && !line.startsWith("#") && !/^\s/.test(line)).length;
}

/**
 * 書き出した `_headers` が、今のビルド結果と一致しているかを確かめる（古いハッシュ・書き換えの検出）。
 *
 * @param {string} headersText 書き出した `_headers` の中身
 * @param {Array<{ file: string, html: string }>} pages 全 HTML
 * @throws {CspBuildError} 一致しない場合
 */
export function verifyHeadersFile(headersText, pages) {
  if (countRules(headersText) !== 1) throw new CspBuildError("_headers のルールが1つではありません", "_headers");
  const ruleLine = headersText.split("\n").find((line) => line.trim() !== "" && !line.startsWith("#") && !/^\s/.test(line));
  if (ruleLine !== HEADERS_RULE_PATH) throw new CspBuildError(`_headers のルールが ${HEADERS_RULE_PATH} ではありません`, "_headers");

  const cspLines = headersText.split("\n").filter((line) => /^\s+Content-Security-Policy:/i.test(line));
  if (cspLines.length !== 1) throw new CspBuildError("Content-Security-Policy の行が1つではありません", "_headers");
  const csp = cspLines[0].replace(/^\s+Content-Security-Policy:\s*/i, "");
  assertSafeCsp(csp);

  const expected = buildCsp(collectHashes(pages.map(({ file, html }) => analyzeHtml(html, file))));
  if (csp !== expected) {
    throw new CspBuildError("_headers の CSP が今のビルド結果と一致しません（古いハッシュ、または手で編集された可能性）", "_headers");
  }
  for (const [name, value] of OTHER_SECURITY_HEADERS) {
    const found = headersText.split("\n").filter((line) => line.trim().toLowerCase().startsWith(`${name.toLowerCase()}:`));
    if (found.length !== 1 || found[0].trim() !== `${name}: ${value}`) {
      throw new CspBuildError(`${name} の行が想定と違います`, "_headers");
    }
  }
}
