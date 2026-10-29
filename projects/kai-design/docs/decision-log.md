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

---

## STEP 3：制作実績ページ（2026-10-29）

### D-025 一覧ページの h1 は「制作実績」
- 決定：`/projects` の h1・title は「制作実績」（ナビゲーションの表記と一致させる）。導入文で「自主制作の架空企業・架空店舗サイトであり、実際の受託案件ではない」ことを明示する。
- 比較：仕様書 4章・Home のリンク文に合わせた「自主制作一覧」→ レビューで不採用。
- 残課題：Home の Selected Projects のリンク文は「自主制作一覧を見る」のまま（STEP 3 では Home を変更しない方針のため）。表記をそろえるかは別途判断する。

### D-026 詳細ページは generateStaticParams + dynamicParams = false + generateMetadata
- `generateStaticParams`：`projects` 配列から `{ slug }` の一覧を返し、ビルド時に `out/projects/ki-to-hibi.html` などを生成する。
- `dynamicParams = false`：静的書き出しでは「リクエスト時に新しいページを作る」ことができない（Next.js 同梱ドキュメントの静的書き出しガイドで `dynamicParams: true` は非対応と明記）。生成していない slug は 404 になることをコードでも明示する。
- `generateMetadata`：title「作品名（自主制作）」、description に種別・要約・架空案件の注記を入れる。
- ページ内でも `notFound()` を呼ぶ：通常は到達しないが、`project` が `undefined` でないことを TypeScript に伝える役割がある（型の絞り込み）。
- props の型は Next.js 16 が生成する `PageProps<"/projects/[slug]">`（`params` は Promise なので await する）。
- 比較：ki-to-hibi の施工事例詳細は `dynamicParams` を指定していない → 静的書き出しでは指定がなくても動くが、意図を明示するため Kai Design では書く。

### D-027 共通部品の追加と、既存部品の最小限の拡張
- 追加：
  - `components/ui/PageHeader`：下層ページの冒頭（英語ラベル＋h1＋導入文）。STEP 4 の about / contact / privacy でも使う。
  - `components/ui/Breadcrumb`：`nav[aria-label]` + `ol`、現在ページは `aria-current="page"`、区切り記号は CSS で描き読み上げない。
  - `components/projects/ProjectGrid`：Home・/projects・詳細ページの「他の制作実績」で同じ並べ方を使うため、SelectedProjects のグリッドを切り出した（CSS は `git mv` で移動）。
  - `components/projects/ProjectOverview`・`CaseStudyContent`：詳細ページの概要（`dl`）とケーススタディ本文。
- 拡張（すべて省略時は従来どおりの動作）：
  - `ProjectCard`：`headingLevel`（h2 / h3）、`imageLoading`（eager / lazy）。
  - `ProjectGrid`：`eagerCount`。`next dev` で「/projects の1枚目の画像が LCP なのに遅延読み込み」と警告が出たため、/projects の1行目（2件）だけ eager にした。
  - `Section`：`spacing="compact"`（詳細ページ用。スマホ約56px〜PC約80px）。
  - `ButtonLink`：`external`（新しいタブで開く、↗ と「（新しいタブで開きます）」の読み上げ用テキスト、`rel="noopener noreferrer"`）。
- Home への影響：変更前後の Home を 375 / 768 / 1280px で撮影し、ピクセル単位で比較して差分 0 を確認した。

### D-028 ケーススタディのデータ設計と情報源の区別
- 型：`CaseStudy`（background / target / design / development / quality / reflection、すべて任意）。値がある項目だけ詳細ページに表示する（仕様書 7章「実際に存在する内容だけ表示」）。
- 各項目の `basis`（根拠）を必須にし、本文の前に表示する。設計資料の「計画・設計意図」と、ソースコードで確認できる「実装の事実」を読者が区別できるようにするため。
- 文章は `data/case-studies/<slug>.ts` に作品ごとのファイルで管理する。各サイトを更新したら、そのファイルだけを直せばよい。
- 情報源：
  - MELLOW COFFEE：制作時の設計資料「AIWC36_Phase2_MELLOW_COFFEE_Wireframe_Process.pptx」（2026-10-29 共有）を正式な参考資料とする。目的・ターゲット・課題・コンセプト・CTA・サイト構成・UI の選定理由・学びは資料から、Development はソースコード（index.html / script.js / style.css）から。資料のサイト構成・必要情報（設備5項目、駐車場・段差）・3つのUIが実装されていることをコードで照合済み。
  - 木と日々：Background・Target・Design は STEP 3 計画の提案文を暫定採用（サイトのコピーとページ構成から整理）。Development はソースコードで確認できる事実のみ。
  - Quality（実施した確認）は両作品とも記録がないため非表示。Reflection は MELLOW COFFEE のみ（設計資料の「今回の学び」）。
- 作らないもの：成果数値・顧客の声・実案件のような表現・確認できていないアクセシビリティ対応。

### D-029 `app/not-found.tsx` を STEP 3 で追加（D-009 の残課題を解消）
- 理由：`dynamicParams = false` により存在しない slug で 404 画面が表示されるようになったため、STEP 6 の予定を前倒しした。
- 内容：共通レイアウト内に、ダークテーマ・日本語の404（トップページ・制作実績への導線）。静的書き出しで `out/404.html` として出力される。
- 確認：`/projects/unknown` が HTTP 404 を返し、背景色が `#111214`（Next.js 既定画面の白背景にならない）。

### D-030 今回は掲載しないもの
- スマホ表示のスクリーンショット：追加しない（利用権の確認対象を増やさないため）。
- GitHub リポジトリへのリンク：掲載を保留する。
- 外部リンク（公開サイト）は新しいタブで開き、そのことを ↗ と読み上げ用テキストで伝える。URL も文字で併記する。

### D-031 MY SOLO（Products）は独立管理する案Bを基本方針とする（記録のみ・未実装）
- D-024 の2案のうち、仕様書 3章「Products は独立した分類」に合わせて案B（`types/product.ts`・`data/products.ts`・Products 用のルート）を基本方針とする。
- 共通化の方針：slug・title・summary・techs・siteUrl・thumbnail などの共通項目は将来 `WorkBase` 型として切り出し、カード等の部品を共有する。ケーススタディは STEP 3 で `CaseStudy` 型として Project から独立させたため、Products でもそのまま使える。
- Hero の代表作品は、Products 追加時に「どの分類のどの作品か」（例：`{ type: "product", slug: "my-solo" }`）で指定する形へ変更する。
- ルート（`/products/[slug]` か別名か）・ナビゲーションの表記は MY SOLO の公開内容が決まった時点で決める。

### D-032 別作業として記録：MELLOW COFFEE 本体への「架空店舗」注記
- 公開中の MELLOW COFFEE（`projects/mellow-coffee`）には、架空店舗であることの注記がない（住所は「東京都○○区○○」等のダミー）。Kai Design 側では詳細ページの冒頭・概要・注記で明示した。
- サイト本体への注記追加は STEP 3 の作業範囲（`projects/kai-design/` のみ）外のため、別作業として行う。

### D-033 検証で使った手順と気づき
- 確認用サーバー：`python3 -m http.server` は `/projects/ki-to-hibi` を `.html` に対応づけないため、Cloudflare Pages と同様に「`/path` → `/path.html`、無ければ `404.html` を 404 で返す」小さな Node サーバーを一時フォルダに用意して確認した（リポジトリには含めない）。
- `next dev` を実行すると `AGENTS.md` が再び書き換わったため、D-013 のとおり元に戻した。
- 公開サイト（`*.pages.dev`）への到達確認は、作業環境のネットワーク制限（プロキシで接続拒否）のため未実施。リンクの href・target・rel は確認済み。

### D-034 根拠（basis）は管理用とし、画面には表示しない（STEP 3 レビューで D-028 を変更）
- 変更内容：D-028 では各ケーススタディ項目の本文の前に根拠を表示していたが、一般の閲覧者には説明的すぎるため表示をやめた。
- 維持するもの：`CaseStudyBlock.basis` は必須項目のまま残す。文章を書く・更新するときに「設計資料の計画」か「ソースコードで確認した実装」かを必ず記録するため（データ管理・レビュー用）。ビルド結果の HTML に根拠の文言が含まれないことを確認した。
- 混同を防ぐ方法（表示側）：
  - 本文の書き分け：想定は「想定しました」、設計の考え方は「〜を目的に／〜しました」、実装済みの事実は「実装しました／しています」。
  - セクションの分け方：Design は設計の考え方、Development は実装した内容。Target の箇条書きは「想定した不安」と見出しを付ける。
  - 文中の「設計資料のサイト構成どおりに」は「設計したサイト構成どおりに」に修正（閲覧者に内部資料名を意識させない）。
- 維持する注記：自主制作・架空案件であることの注記（ページ冒頭・作品概要・注記欄）は変更なし。

### D-035 「他の制作実績」カード画像の遅延読み込みは維持する
- 現象：ページ全体のスクリーンショットで、ページ下部のカード画像が空白に写った。
- 原因：`loading="lazy"` の画像は画面に近づくまで読み込まれない。全体撮影はスクロールせずに行うため、読み込みが始まっていなかった（表示不具合ではない）。
- 確認：両作品 × 375 / 768 / 1280px で、少しずつスクロールした後に画像が読み込まれる（1600×1000px）ことを確認し、読み込み後のスクリーンショットを撮影した。
- 判断：ページ下部の画像のため lazy を維持する（最初に表示する画像の通信を優先できる）。

### 公開前の未解決事項（STEP 3 時点で更新）
- [ ] MELLOW COFFEE・木と日々のスクリーンショットに含まれる写真の利用権確認（D-020）。確認できるまで公開可能と判断しない。
- [ ] About の経歴・文章の最終確認。
- [x] ~~`/projects`・`/projects/[slug]` の実装~~（STEP 3 で実装）
- [ ] 未作成ページ `/about`・`/contact`・`/privacy` の実装（STEP 4）。
- [ ] Journal に掲載する公開済み note 記事・note プロフィールの URL。
- [ ] 木と日々のケーススタディ（Background・Target・Design）の本人による確認・更新（暫定採用。D-028）。
- [ ] Quality（実施した確認）・木と日々の Reflection の情報提供（記録が得られたら追加）。
- [ ] MELLOW COFFEE 本体への「架空店舗」注記（別作業。D-032）。
- [ ] Home のリンク文「自主制作一覧を見る」と /projects の h1「制作実績」の表記をそろえるか（D-025）。
- [ ] 公開サイトへの外部リンクの到達確認（作業環境では未確認。D-033）。

### 学習ポイント（SNS・note 向けメモ）
- 静的書き出しでの動的ルート：`generateStaticParams` が「ビルド時に作るページの一覧」を返し、`dynamicParams = false` で「それ以外は存在しない」と宣言する。サーバーが無くても `/projects/[slug]` が成り立つ仕組み。
- `notFound()` の2つの役割：404 にすることと、TypeScript の型の絞り込み。
- 「事実と計画を分けて書く」データ設計：`basis`（根拠）を必須項目にして、型で書き忘れを防ぐ。画面に出すかどうかは別の判断（管理用の情報と、閲覧者に見せる情報を分ける。D-034）。
- 遅延読み込み（`loading="lazy"`）の画像は、スクロールせずに撮った全体スクリーンショットでは空白に写る。表示不具合と区別するには、スクロール後の読み込み状態（`naturalWidth`）を確認する。
- 見出しレベルを props で切り替える部品（`const Heading = headingLevel` と大文字の変数にする理由）。
- 共通部品を切り出すときは、変更前後のスクリーンショットをピクセル比較して「見た目が変わっていない」ことを確かめる。
- `as const satisfies` で、設定配列のキーが型（`keyof CaseStudy`）と一致するかをチェックする方法。
