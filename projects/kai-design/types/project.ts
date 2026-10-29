/**
 * 自主制作（Projects）1件分のデータ型。
 *
 * data/projects.ts で値を定義し、Home の Selected Projects と
 * STEP 3 で作る一覧（/projects）・詳細（/projects/[slug]）の両方から読み込む。
 * 実際の受託案件（Works）は初期版では扱わない（仕様書 3章）。
 */

/** 作品画像。next/image に渡す値をまとめたもの */
export type ProjectImage = {
  /** public/ からの絶対パス（例：`/images/projects/ki-to-hibi/works-section.jpg`） */
  src: string;
  /** 代替テキスト。何の画面かを日本語で説明する */
  alt: string;
  /**
   * 画像ファイルの実寸。next.config.ts で画像最適化を無効（unoptimized）にしているため、
   * ここで指定した値は表示領域の確保（レイアウトのずれ防止）にだけ使われる。
   */
  width: number;
  height: number;
};

export type Project = {
  /** URL に使う識別子。/projects/[slug] の generateStaticParams でも使う */
  slug: string;
  /** 作品名（架空の企業・店舗名） */
  title: string;
  /** 作品の種別（例：「架空の住宅会社のWebサイト（複数ページ）」） */
  kind: string;
  /** 架空であることの区分。カードのラベルとして必ず表示する */
  fictionLabel: "架空企業" | "架空店舗";
  /** 一覧カード用の短い紹介文。未実施の調査や未計測の成果は書かない */
  summary: string;
  /** 使用技術 */
  techs: readonly string[];
  /** 公開サイトのURL */
  siteUrl: string;
  /** 一覧カード用の画像。詳細ページのメイン画像にも使う */
  thumbnail: ProjectImage;
  /** Home の Selected Projects に表示するか */
  featured: boolean;
  /** ページ・セクション構成（詳細ページの Overview に表示） */
  structure: readonly string[];
  /** 閲覧者に伝えるべき注記（例：「問い合わせフォームはデモで送信されません」）。任意 */
  notes?: readonly string[];
  /** 詳細ページ（/projects/[slug]）のケーススタディ */
  caseStudy: CaseStudy;
};

/** 「見出し＋説明」の形で並べる項目（工夫した点など） */
export type CaseStudyItem = {
  title: string;
  body: string;
};

/**
 * ケーススタディの1項目分（Background・Design など）。
 *
 * paragraphs（段落）・list（箇条書き）・items（見出し＋説明のリスト）を必要な分だけ持つ。
 * 表示順は paragraphs → list → items。
 * basis（根拠）は必須にしている。設計資料に書かれた「計画」と、ソースコードで確認できる
 * 「実装の事実」を混同しないよう、文章を書く・更新するときに情報源を必ず記録するため。
 * basis は管理用の項目で、画面には表示しない（D-034。STEP 3 レビューで表示をやめた）。
 */
export type CaseStudyBlock = {
  /** 情報の根拠（管理用・非表示）。例：「制作時の設計資料に基づく」「ソースコードで確認できる実装」 */
  basis: string;
  paragraphs?: readonly string[];
  /** 箇条書き。listLabel はリストの前に置く短い見出し（例：「想定した不安」） */
  list?: readonly string[];
  listLabel?: string;
  items?: readonly CaseStudyItem[];
};

/**
 * 作品詳細のケーススタディ（仕様書 7章）。
 *
 * すべて任意項目。確認できた情報がある項目だけを書き、無い項目は詳細ページに表示しない。
 * 未実施の調査・未計測の成果・顧客の声は書かない。
 * Overview と Links は Project の基本項目（kind・techs・siteUrl など）から作るため、ここには含めない。
 * 将来の Products（MY SOLO）でも同じ型を使い回せるよう、Project とは別の型にしている（D-024・D-031）。
 */
export type CaseStudy = {
  /** 制作の背景・目的 */
  background?: CaseStudyBlock;
  /** 想定ターゲットと課題。すべて「想定（仮説）」であり、実査の結果ではない */
  target?: CaseStudyBlock;
  /** 情報設計・UI の工夫 */
  design?: CaseStudyBlock;
  /** 実装の工夫 */
  development?: CaseStudyBlock;
  /** 実際に行った確認・検証 */
  quality?: CaseStudyBlock;
  /** 学び・今後の課題 */
  reflection?: CaseStudyBlock;
};
