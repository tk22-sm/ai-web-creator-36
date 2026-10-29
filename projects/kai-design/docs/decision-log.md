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

---

## STEP 2-B：Homeページ（2026-10-28）

### D-014 Home のセクションはすべて Server Component
- 決定：`components/home/*`・`components/projects/ProjectCard`・`components/ui/*` に `"use client"` を付けない。
- 理由：Home には開閉・入力などブラウザ側で保持する状態がない。JavaScript を増やさず、Hydration mismatch の原因も作らない。
- 比較：スクロール時の表示（IntersectionObserver）を今入れる案 → Client Component が必要になり、仕様書 11章の STEP 5（動き）の役割と重なるため不採用。

### D-015 デザイン方針：ミニマル55%・クリエイティブ45%（目安）
- 決定（2026-10-28 追加確定）：
  - 全体は余白と読みやすさを優先し、洗練された印象にする。
  - Hero は大きな日本語コピーと代表作品のビジュアルで印象を残す。
  - Selected Projects は作品画像を 16:10 で大きく見せる。
  - Approach・About は装飾を抑え（番号・区切り線・テキストのみ）、信頼感を優先する。
  - 大胆さは文字サイズ・レイアウト・余白の対比で表現し、装飾（グラデーション・図形・背景画像など）は増やさない。
  - 配色は仕様書 5章のまま（ダーク背景＋ミントのアクセント）。新しい色トークンは追加していない。
  - アニメーションは最小限（ボタン・リンクの色と矢印の 0.2 秒の変化のみ）。Hero のフェード等は STEP 5。
- 影響：既存トークン（`--fs-display` など）の値は変更していない。

### D-016 仕様書 9章の構成に3コンポーネントを追加
- `components/ui/Section.tsx`：英語ラベル＋日本語 h2、`aria-labelledby`、最大幅コンテナを5セクションで共通化。STEP 3 以降の下層ページでも再利用する想定。
- `components/ui/ButtonLink.tsx`：CTA（primary / secondary / text）の見た目とホバー・フォーカスを統一。移動を伴うため `<button>` ではなく `<a>`（next/link）。
- `components/home/ContactCta.tsx`：Home の Contact は誘導のみ。STEP 4 のフォーム本体（`contact/ContactForm.tsx`）と名前で区別する。
- 削除：`app/page.module.css`（STEP 2-A のプレースホルダー専用だったため）。

### D-017 Hero の代表作品は MELLOW COFFEE（仮）
- 理由：木と日々のファーストビューは文字中心で、縮小表示すると印象が弱い。MELLOW COFFEE は写真を含み、Hero の「ビジュアルで印象を残す」方針に合う。
- Selected Projects の並び順は仕様書 6章の記載順（木と日々 → MELLOW COFFEE）のまま。
- 差し替えは `data/projects.ts` の `HERO_PROJECT_SLUG` を変えるだけ。Hero コンポーネントには作品名・画像パスを直接書かず、作品データから取得する。

### D-018 作品・記事データは型付きの TypeScript ファイルで管理
- `types/project.ts`（Project 型）＋ `data/projects.ts`、`data/articles.ts`（Article 型は利用箇所が Journal のみのため同じファイルに定義。`data/navigation.ts` と同じ方式）。
- 画像はパス文字列と実寸（width / height）をデータに持たせる。
- 比較：画像の静的 import（寸法を自動取得できる）→ データが単純な値でなくなり、仕様書 9章の `public/images/` 配置とも異なるため不採用。JSON → 型を別に書く必要があるため不採用。
- 日付は `YYYY-MM-DD` 文字列で持ち、表示時は文字列置換だけで `YYYY.MM.DD` に整形（`toLocaleDateString` は実行環境で結果が変わり得るため使わない）。

### D-019 Journal は記事0件でもセクションを表示する
- 理由：ナビの「学習・制作記録」（`/#journal`）の移動先のため。公開済み記事の URL が未確定なので、現在は「公開準備中」の案内を表示する。
- note プロフィールへのリンクは `noteProfileUrl` が null の間は表示しない。
- 外部リンクは新しいタブで開き、「（新しいタブで開きます）」を読み上げ用テキスト（`.visually-hidden`、globals.css に追加）で伝える。

### D-020 作品画像は既存サイトのスクリーンショット（仮・公開可否は未確認）
- 作成方法：同リポジトリの `projects/ki-to-hibi`（ビルド後の `out/`）と `projects/mellow-coffee` をローカルで配信し、Playwright で 16:10 の範囲を JPEG（品質80、1600×1000px）で撮影。追加パッケージなし。
  - 木と日々：施工事例の一覧部分（`works-section.jpg`、約112KB）
  - MELLOW COFFEE：ファーストビュー部分（`hero-section.jpg`、約136KB）
- **確認事項**：画面内の写真（住宅・カフェの写真）の出どころと利用権がリポジトリ内の記録から確認できない。利用権を確認できるまで、公開可能とは判断しない。
- `next.config.ts` が `images.unoptimized: true`（静的書き出しのため）なので `srcset` は出力されない。表示サイズに合わせた画像を自分で用意する方針。
- Hero 画像は `loading="eager"` + `fetchPriority="high"`（Next.js 16 で `priority` は非推奨）。

### D-021 Hero 見出しの文字サイズを列幅から決める
- 発生した問題：`--fs-display`（最大 4.5rem）のままだと、PC の左列で「伝えるべ／きことを、」のように句の途中で改行された。
- 対処：テキスト列を `container-type: inline-size` にし、`font-size: min(var(--fs-display), 10.6cqi)` で最長の句（9文字）が1行に収まる最大サイズにする。各句は `inline-block` で途中改行を防ぐ。列比率は テキスト6：画像5。
- 比較：`<br>` で改行位置を固定する案 → スマホ幅で不自然な改行が残るため不採用。
- あわせて見出し全体に `word-break: auto-phrase`（対応ブラウザで文節単位の改行）を追加。非対応ブラウザでは従来どおり。

### D-022 未作成ページへのリンクはそのまま置く
- `/projects`・`/projects/[slug]`・`/about`・`/contact` は STEP 3・4 で作成するまで 404 になる（静的配信時、next/link の先読みでも 404 がコンソールに出る）。公開は STEP 6 のため、公開前に解消される。

### D-023 型チェックの前に `next typegen` が必要
- `npx tsc --noEmit` を単独で実行すると `Cannot find name 'LayoutProps'` で失敗する。`LayoutProps` はビルド時または `next typegen` で生成される型のため。検証手順は `npx next typegen && npx tsc --noEmit` とする。

### D-024 将来方針：Hero の代表作品を MY SOLO に差し替える（記録のみ・未実装）
- 方針（2026-10-29 共有）：自主開発Webサービス「MY SOLO」が完成したら、Hero の代表作品を MELLOW COFFEE から MY SOLO に差し替える。
- 現在の構造：Hero は `data/projects.ts` の `HERO_PROJECT_SLUG` と作品データから画像・作品名・種別を取得する。作品名・画像パスをコンポーネントに直接書かない構造を維持する。
- 将来の課題：MY SOLO は架空案件ではなく自主開発プロダクト（仕様書 3章の Products）。現在の `Project` 型は「自主制作の架空案件」専用（`fictionLabel` が必須、カードに「自主制作」ラベルを固定表示）のため、Products 追加時に次のいずれかで区別できるようにする。
  - 案A：`Project` 型に区分（例：`category: "fictional" | "product"`）を追加し、`fictionLabel` を架空案件のときだけ必須にする（判別可能なユニオン型）。
  - 案B：Products 用の型・データ（`types/product.ts`、`data/products.ts`）を別に作り、Hero は両方から選べるようにする。
  - どちらを採るかは MY SOLO の公開時期・掲載内容が決まった時点で判断する。今回はリファクタリングしない。
- 注意：差し替え時は Hero のキャプション（現在「自主制作：作品名（種別）」）が Products でも正しい表記になるか確認する。

### 公開前の未解決事項（STEP 2-B 時点）
- [ ] MELLOW COFFEE・木と日々のスクリーンショットに含まれる写真の利用権確認（D-020）。確認できるまで公開可能と判断しない。
- [ ] About の経歴・文章の最終確認（2026年4月以降の業務内容の記載可否を含む）。
- [ ] 未作成ページ `/projects`・`/projects/[slug]`・`/about`・`/contact`・`/privacy` の実装（STEP 3・4。D-022）。
- [ ] Journal に掲載する公開済み note 記事・note プロフィールの URL（仕様書 14章）。

### 学習ポイント（SNS・note 向けメモ）
- カード全体をクリック可能にする「疑似要素を広げる」手法と、`:has()` によるカード単位のフォーカス表示（非対応ブラウザでリングが消えないよう `@supports` で囲む）。
- コンテナクエリ単位（`cqi`）で、見出しを「列の幅にちょうど収まる大きさ」にする方法。
- `images.unoptimized` 環境での `next/image` の役割（最適化はされないが、寸法指定によるレイアウトのずれ防止・遅延読み込みは効く）。
