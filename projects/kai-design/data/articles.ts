/**
 * Journal（学習・制作記録）に表示する note 記事の一覧（仕様書 6章）。
 *
 * - 公開済みの記事だけを手動で登録する。未公開・下書きの記事は登録しない。
 * - 配列の並び順がそのまま表示順。Home には先頭から最大3件を表示する
 *   （おすすめ・新着のどちらを優先するかは、並べ替えで調整する）。
 * - 現時点では公開済み記事の URL が未確定のため空配列（仕様書 14章）。
 *   空の間は Journal セクションに「準備中」の案内を表示する。
 */

export type Article = {
  /** 記事タイトル */
  title: string;
  /** 記事の URL（note の公開ページ） */
  url: string;
  /** 分類（例：「制作記録」「学習」） */
  category: string;
  /** 公開日。`YYYY-MM-DD` 形式の文字列で書く（表示時に整形する） */
  publishedAt: string;
};

export const articles: readonly Article[] = [];

/**
 * note のプロフィールページの URL。
 * 未確定のため null。null の間はプロフィールへのリンクを表示しない。
 */
export const noteProfileUrl: string | null = null;
