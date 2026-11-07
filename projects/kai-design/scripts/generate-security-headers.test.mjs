/**
 * scripts/generate-security-headers.mjs を実際に実行するテスト（D-059）。実行：npm test
 * 一時フォルダに Next.js の出力をまねた out/ を作り、成功する場合と止まる場合を確かめる。
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, test } from "node:test";
import { verifyHeadersFile } from "../lib/csp.mjs";

const script = path.join(import.meta.dirname, "generate-security-headers.mjs");
const TURBOPACK = '(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push({"otherChunks":[]});';
const html = (data, extra = "") =>
  '<!DOCTYPE html><html lang="ja"><head><meta charSet="utf-8"/>' +
  '<script src="/_next/static/chunks/a.js" async=""></script></head><body><main>x</main>' +
  `<script id="_R_">${TURBOPACK}</script><script>(self.__next_f=self.__next_f||[]).push([0])</script>` +
  `<script>self.__next_f.push([1,"${data}"])</script>${extra}</body></html>`;

const dirs = [];
function makeOut(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "kai-csp-"));
  dirs.push(root);
  const out = path.join(root, "out");
  for (const [file, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
    fs.writeFileSync(path.join(out, file), content);
  }
  return out;
}
const run = (out) => spawnSync(process.execPath, [script, out], { encoding: "utf8" });
const pagesOf = (out) =>
  fs
    .readdirSync(out, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(".html"))
    .map((file) => ({ file: file.split(path.sep).join("/"), html: fs.readFileSync(path.join(out, file), "utf8") }));

afterEach(() => {
  while (dirs.length) fs.rmSync(dirs.pop(), { recursive: true, force: true });
});

describe("generate-security-headers", () => {
  test("正常な出力なら out/_headers を作り、内容が全 HTML と一致する", () => {
    const out = makeOut({ "index.html": html("index"), "404.html": html("404"), "projects/a.html": html("a"), "a.txt": "rsc" });
    const result = run(out);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /HTML 3 件、インラインスクリプトのハッシュ 5 件/);
    const headers = fs.readFileSync(path.join(out, "_headers"), "utf8");
    assert.doesNotThrow(() => verifyHeadersFile(headers, pagesOf(out)));
    // ログにハッシュ値を出さない
    assert.doesNotMatch(result.stdout + result.stderr, /sha256-/);
  });

  test("想定外のインラインスクリプトがあれば止め、_headers を残さない", () => {
    const out = makeOut({ "index.html": html("index", "<script>alert(1)</script>"), "404.html": html("404") });
    const result = run(out);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /生成を中止しました：index\.html：想定外のインラインスクリプト/);
    assert.equal(fs.existsSync(path.join(out, "_headers")), false);
  });

  test("古い _headers が残っていれば止める（public/_headers の混入・ビルドし直していない場合）", () => {
    const out = makeOut({ "index.html": html("index"), "404.html": html("404"), _headers: "/*\n  X-Old: 1\n" });
    const result = run(out);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /out\/_headers が既にあります/);
    assert.equal(fs.existsSync(path.join(out, "_headers")), false);
  });

  test("ビルド後に HTML が変わったら、以前の _headers では検査に通らない", () => {
    const out = makeOut({ "index.html": html("index"), "404.html": html("404") });
    assert.equal(run(out).status, 0);
    const headers = fs.readFileSync(path.join(out, "_headers"), "utf8");
    fs.writeFileSync(path.join(out, "index.html"), html("index-rebuilt"));
    assert.throws(() => verifyHeadersFile(headers, pagesOf(out)), /一致しません/);
  });

  test("404.html が無ければ止める（Cloudflare が SPA として扱うため）", () => {
    const out = makeOut({ "index.html": html("index") });
    const result = run(out);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /404\.html がありません/);
  });

  test("Pages Functions（_worker.js）があれば止める", () => {
    const out = makeOut({ "index.html": html("index"), "404.html": html("404"), "_worker.js": "export default {}" });
    const result = run(out);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Pages Functions/);
  });

  test("out/ が無ければ止める", () => {
    const result = run(path.join(os.tmpdir(), "kai-csp-does-not-exist"));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /out\/）がありません/);
  });
});
