# Kai Design 意思決定ログ

実装中に行った設計判断と、仕様書（`kai-design-implementation-spec-v1.md`）からの構成変更を記録する。
仮値は「仮」と明記し、確定したら追記で更新する（過去の記録は消さない）。

---

## STEP 2-A：デザイン基盤・共通レイアウト（2026-10-27）

### D-001 フォントはシステムフォントを仮採用
- 決定：`--font-sans` にヒラギノ等のシステムフォントを設定。英語見出し用の `--font-heading` も同じ値で用意。
- 理由：フォントは仕様書14章で未確定。Webフォント（特に日本語）は容量が大きく、確定前に読み込む利点が小さい。
- 比較：`next/font/google` で Noto Sans JP 等を先に導入する案 → 確定後の差し替えコストが増えるため不採用。
- 影響：STEP 5 で変数の値を差し替えるだけで全体に反映できる。

### D-002 補助文字色 `#A3A6AD`（仮）
- 決定：`--color-text-muted: #a3a6ad`。
- 理由：背景 `#111214` 上 7.69:1、サーフェス `#1C1E22` 上 6.85:1 で WCAG AA（4.5:1）を余裕を持って満たしつつ、メイン文字 `#F5F5F2` と階層差が出る。
- 比較：`#B4B7BD`（9.33:1、差が小さい）、`#8B8F97`（5.78:1、小さい文字で余裕が少ない）。

### D-003 ブレークポイントは 768px / 1024px（モバイルファースト）
- 768px 以上で PC 用ナビへ切り替え、1024px 以上でヘッダー高さ・余白を拡大。
- CSS変数は `@media` 条件に使えないため、値は `globals.css` 冒頭コメントに集約して各ファイルで直接記述する。

### D-004 ダークテーマのみ
- 仕様書5章の配色（背景 `#111214`）に従い、`color-scheme: dark` と `viewport.themeColor` を設定。初期テンプレートの `prefers-color-scheme` による切り替えは削除。

### D-005 仕様書9章の構成に3ファイルを追加
- 追加：`components/layout/MobileNav.tsx`、`components/layout/NavLinks.tsx`、`data/navigation.ts`
- 理由：
  - `NavLinks`：現在地表示（`aria-current`）に `usePathname` が必要で、これは Client Component でしか使えない。リンク一覧だけを Client に切り出すことで、Header / Footer 本体を Server Component のまま保ち、ブラウザに送る JavaScript を最小限にする。
  - `MobileNav`：開閉状態（useState）とキーボード操作を持つため Client Component として分離。
  - `data/navigation.ts`：Header（PC・スマホ）と Footer の3か所で同じ項目を使うため、1か所で管理する。
- 比較：Header 全体を Client Component にする案（ki-to-hibi の方式）→ 実装は単純だが、ロゴやレイアウトまでブラウザ側で再実行されるため不採用。

### D-006 スマホメニューは「ディスクロージャー」として実装（モーダルにしない）
- 決定：ボタン（`aria-expanded` / `aria-controls`）で `<nav>` を開閉。フォーカスの閉じ込めは行わず、フォーカスがメニュー外へ出たら閉じる。
- 閉じる操作：ボタン再押下、Esc（ボタンへフォーカスを戻す）、リンククリック、フォーカスが外へ出る、768px 以上への画面幅変更。
- 理由：ナビゲーションの開閉は W3C の Disclosure パターンに当てはまる。モーダル（`role="dialog"` + フォーカストラップ）は実装量が多く、誤実装時にキーボード利用者が抜け出せなくなるリスクがある。
- 補足：開いている間は `body` のスクロールを止め、背面が動かないようにする。

### D-007 `<main>` は layout.tsx で一元管理
- 決定：`<main id="main">` を RootLayout に置き、各 `page.tsx` は `<main>` を書かない。
- 理由：「本文へスキップ」リンクの移動先を全ページで保証し、`<main>` の重複を防ぐ。

### D-008 ヘッダーは sticky、`backdrop-filter` は使わない
- 理由：`backdrop-filter` を付けると、子要素の `position: fixed`（スマホメニューのパネル）の基準がヘッダーになり、パネルが画面全体を覆えなくなる。
- `html { scroll-padding-top: var(--header-height) }` で、`/#journal` などのアンカー先がヘッダーに隠れないようにした。

### D-009 Header / Footer は背景色と文字色を対で指定
- 発生した問題：Next.js 既定の404画面は `body` の文字色・背景色を独自に上書きするため、ヘッダーの文字が暗い背景上で黒くなり読めなくなった。
- 対処：`.header` / `.footer` に `color: var(--color-text)` を指定。
- 残課題：404画面の本文部分は白背景のまま。`app/not-found.tsx` は STEP 6 で実装する（承認済み方針）。

### D-010 著作権表示の年は固定値（`© 2026`）
- 理由：`new Date()` はビルド日時に依存し、ビルドのたびに表示が変わり得る。サイト公開開始年として固定する。

### D-011 メタデータ
- `title.template: "%s | Kai Design"`、`default` は仮の文言。`description` は仕様書6章 Hero 説明文をもとにした仮の文言。
- `metadataBase`・OGP はドメイン未確定のため未設定（仕様書14章、STEP 6 で対応）。
- favicon は Next.js 初期のものを維持（ロゴ未確定のため）。

### D-012 Hydration mismatch の調査結果
- クラウド環境の Chromium（ja-JP / en-US）、`next dev` と静的書き出し（`out/`）の両方で、警告は再現しなかった。
- 実装上の予防：描画中に `Date`・乱数・`window` を使わない、MobileNav の初期状態は常に「閉じる」、ID は `useId` で生成。
- 以前ローカル（Mac）で出た警告は、ブラウザ拡張機能が `<html>` / `<body>` に属性を追加した可能性が最も高い。再発時は警告全文とシークレットウィンドウでの再現有無を確認する。`suppressHydrationWarning` で隠す対応は取らない。

### D-013 AGENTS.md の自動書き換えはコミットしない
- `next dev` 実行時に見出しレベル（`#` → `##`）が書き換わるが、内容に変化はなく STEP 2-A と無関係なため、差分は元に戻してコミット対象から外す。
