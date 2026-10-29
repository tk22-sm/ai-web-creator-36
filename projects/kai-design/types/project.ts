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
  /** 一覧カード用の画像 */
  thumbnail: ProjectImage;
  /** Home の Selected Projects に表示するか */
  featured: boolean;
};
