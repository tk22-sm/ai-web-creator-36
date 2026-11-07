/**
 * ビルド結果（out/）から、CSP とセキュリティヘッダーを書いた out/_headers を作る（D-059）。
 *
 * 実行：npm run build（`next build` の直後に自動で実行される）
 *       単独で実行する場合も、必ず `next build` の直後に実行する（out/_headers が既にあれば止まる）。
 *
 * 処理の流れ：
 * 1. 前提の確認（out/ と 404.html がある、Pages Functions を使っていない、古い _headers が無い）
 * 2. 全 HTML を読み取り、想定外の構造が無いことを確認しながらハッシュを集める（lib/csp.mjs）
 * 3. 全ページ共通の CSP を組み立て、out/_headers に書き出す
 * 4. 書き出したファイルを読み直し、全 HTML ともう一度照らし合わせる
 * どこかで問題が見つかったら、終了コード 1 で止める（npm run build 全体が失敗し、公開されない）。
 * ハッシュや HTML の中身はログに出さない。
 */
import fs from "node:fs";
import path from "node:path";
import { CspBuildError, analyzeHtml, buildCsp, collectHashes, renderHeadersFile, verifyHeadersFile } from "../lib/csp.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const outDir = path.resolve(process.argv[2] ?? path.join(projectRoot, "out"));
const headersPath = path.join(outDir, "_headers");

/** 前提の確認。どれか1つでも満たさなければ止める */
function checkPreconditions() {
  if (!fs.existsSync(outDir) || !fs.statSync(outDir).isDirectory()) {
    throw new CspBuildError("ビルド結果のフォルダ（out/）がありません。next build を先に実行してください");
  }
  if (fs.existsSync(headersPath)) {
    // next build は out/ を作り直すため、通常は存在しない。public/_headers の混入か、ビルドせずに再実行した可能性
    throw new CspBuildError("out/_headers が既にあります。public/_headers を置いていないか確認し、next build からやり直してください");
  }
  if (!fs.existsSync(path.join(outDir, "404.html"))) {
    // 404.html が無いと Cloudflare Pages は SPA として扱い、存在しない URL にもトップページを返してしまう
    throw new CspBuildError("out/404.html がありません");
  }
  for (const candidate of [path.join(projectRoot, "functions"), path.join(outDir, "_worker.js"), path.join(outDir, "functions")]) {
    if (fs.existsSync(candidate)) {
      // Pages Functions が返す応答には _headers が適用されない（Cloudflare 公式）
      throw new CspBuildError(`Pages Functions のファイル（${path.relative(projectRoot, candidate)}）があります。_headers の CSP が適用されなくなります`);
    }
  }
}

/** out/ の中の HTML をすべて読む */
function readPages() {
  const files = fs
    .readdirSync(outDir, { recursive: true })
    .map(String)
    .filter((f) => f.toLowerCase().endsWith(".html"))
    .sort();
  if (files.length === 0) throw new CspBuildError("out/ に HTML がありません");
  return files.map((file) => ({ file: file.split(path.sep).join("/"), html: fs.readFileSync(path.join(outDir, file), "utf8") }));
}

try {
  checkPreconditions();
  const pages = readPages();
  const analyses = pages.map(({ file, html }) => analyzeHtml(html, file));
  const hashes = collectHashes(analyses);
  const text = renderHeadersFile(buildCsp(hashes));
  fs.writeFileSync(headersPath, text, { encoding: "utf8", flag: "wx" });

  // 書き出したファイルを読み直し、HTML も改めて読み込んで照らし合わせる
  verifyHeadersFile(fs.readFileSync(headersPath, "utf8"), readPages());

  console.log(
    `[Kai Design] セキュリティヘッダーを生成しました：HTML ${pages.length} 件、` +
      `インラインスクリプトのハッシュ ${hashes.scriptHashes.length} 件、style 属性のハッシュ ${hashes.styleHashes.length} 件`,
  );
} catch (error) {
  // 書きかけ・不一致の _headers を残さない（残すと古い CSP のまま公開される可能性がある）
  if (fs.existsSync(headersPath)) {
    try {
      fs.rmSync(headersPath);
    } catch {
      // 削除に失敗しても、終了コード 1 でビルドは止まる
    }
  }
  const message = error instanceof CspBuildError ? error.message : "想定外のエラーが発生しました";
  console.error(`[Kai Design] セキュリティヘッダーの生成を中止しました：${message}`);
  process.exit(1);
}
