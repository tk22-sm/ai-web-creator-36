/**
 * 公開してはいけない情報が、リポジトリやビルド結果に混入していないかを確認する（D-055）。
 *
 * 実行：npm run check:public            … Git で管理する（予定の）ファイルと out/ を検査
 *       npm run check:public -- <dir>…  … 追加のフォルダも検査
 *
 * 検査する内容：
 * - メールアドレス（例示用に予約された example ドメイン以外）
 * - Formspree の送信先URLにフォームIDが書かれている箇所（ソースのみ。テスト用の架空IDは除く）
 * - .env.example にフォームIDの値が書かれている
 * - 秘密鍵・GitHub トークン・AWS キーなど、代表的な秘密情報の形式
 * - out/ がある場合：out/_headers があり、CSP が今のビルド結果と一致していること（D-059）
 * 見つかった値そのものは表示しない（ログに残さないため）。見つかったら終了コード 1 で終わる。
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { CspBuildError, verifyHeadersFile } from "../lib/csp.mjs";

const projectRoot = path.resolve(import.meta.dirname, "..");
const extraDirs = process.argv.slice(2).map((d) => path.resolve(d));

/** テストで使う架空のフォームID（実在しない） */
const DUMMY_FORM_IDS = new Set(["abcd1234"]);
const EMAIL = /[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}/g;
const ALLOWED_EMAIL = /@([A-Za-z0-9-]+\.)*example\.[A-Za-z.]+$/i;
const SECRET_PATTERNS = [
  ["秘密鍵", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ["GitHub トークン", /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/],
  ["AWS アクセスキー", /\bAKIA[0-9A-Z]{16}\b/],
  ["API キー（sk- 形式）", /\bsk-[A-Za-z0-9]{20,}/],
  ["Slack トークン", /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
];

/** 検査対象のファイル一覧 */
function listFiles() {
  const tracked = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { cwd: projectRoot, encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .map((f) => ({ file: path.join(projectRoot, f), kind: "source" }));
  const builtDirs = [path.join(projectRoot, "out"), ...extraDirs].filter((d) => fs.existsSync(d));
  const built = builtDirs.flatMap((dir) =>
    fs.readdirSync(dir, { recursive: true }).map((f) => ({ file: path.join(dir, f), kind: "build" })),
  );
  return [...tracked, ...built].filter(({ file }) => fs.existsSync(file) && fs.statSync(file).isFile());
}

const findings = [];
for (const { file, kind } of listFiles()) {
  if (/\.(png|jpe?g|gif|webp|ico|woff2?)$/i.test(file)) continue;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const rel = path.relative(projectRoot, file);
  lines.forEach((line, i) => {
    const at = `${rel}:${i + 1}`;
    for (const m of line.matchAll(EMAIL)) {
      if (!ALLOWED_EMAIL.test(m[0])) findings.push(`${at} メールアドレス（example 以外）`);
    }
    for (const [label, re] of SECRET_PATTERNS) if (re.test(line)) findings.push(`${at} ${label}の形式`);
    if (kind === "source") {
      for (const m of line.matchAll(/formspree\.io\/f\/([A-Za-z0-9]{4,})/g)) {
        if (!DUMMY_FORM_IDS.has(m[1])) findings.push(`${at} 送信先URLにフォームIDが直接書かれている`);
      }
      if (rel === ".env.example" && /^NEXT_PUBLIC_FORMSPREE_FORM_ID=\S/.test(line)) {
        findings.push(`${at} .env.example にフォームIDの値が書かれている`);
      }
    }
  });
}

// ビルド結果のセキュリティヘッダー（D-059）：out/_headers が無い・古い場合は公開できない
const outDir = path.join(projectRoot, "out");
if (fs.existsSync(outDir)) {
  const headersPath = path.join(outDir, "_headers");
  if (!fs.existsSync(headersPath)) {
    findings.push("out/_headers がありません（next build だけを実行した可能性。npm run build でビルドし直してください）");
  } else {
    const pages = fs
      .readdirSync(outDir, { recursive: true })
      .map(String)
      .filter((f) => f.toLowerCase().endsWith(".html"))
      .map((f) => ({ file: f.split(path.sep).join("/"), html: fs.readFileSync(path.join(outDir, f), "utf8") }));
    try {
      verifyHeadersFile(fs.readFileSync(headersPath, "utf8"), pages);
    } catch (error) {
      findings.push(`out/_headers ${error instanceof CspBuildError ? error.message : "を確認できません"}`);
    }
  }
}

if (findings.length > 0) {
  console.error(`公開してはいけない可能性のある情報が ${findings.length} 件見つかりました（値は表示しません）：`);
  for (const f of findings) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("公開前チェック：問題は見つかりませんでした。");
