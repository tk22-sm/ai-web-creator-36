/**
 * サイト共通のナビゲーション項目。
 *
 * Header（PC・スマホ）と Footer の両方がこの配列を読み込んで描画する。
 * 項目やURLの変更はこのファイルだけで済み、表示箇所ごとのズレを防げる。
 *
 * 仕様書 4章：ナビゲーションは「制作実績」「私について」「学習・制作記録」「お問い合わせ」。
 * 学習・制作記録はホーム内の Journal セクション（id="journal"）へ誘導する。
 * Works（受託実績）は初期公開時には作らない（仕様書 3章）。
 */

export type NavItem = {
  /** リンク先。サイト内パス、またはページ内アンカー付きパス（例：`/#journal`） */
  href: string;
  /** 表示ラベル（日本語） */
  label: string;
};

export const mainNavItems: readonly NavItem[] = [
  { href: "/projects", label: "制作実績" },
  { href: "/about", label: "私について" },
  { href: "/#journal", label: "学習・制作記録" },
  { href: "/contact", label: "お問い合わせ" },
];

/** フッターのみに表示する項目 */
export const legalNavItems: readonly NavItem[] = [
  { href: "/privacy", label: "個人情報の取り扱い" },
];
