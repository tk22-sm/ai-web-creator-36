/**
 * Kai Design の SNS アカウント（ヘッダー・スマホメニュー・フッターのリンク、D-074）。
 *
 * - URL はこのファイルだけで管理する。表示箇所（components/layout/SocialLinks）はこの配列を読む。
 * - note のプロフィール URL は、Journal（data/articles.ts の noteProfileUrl）でもこの値を使う。
 * - お問い合わせの代わりの窓口（Instagram の DM）も同じアカウントを使う。
 *   data/contact-channels.ts はここの値を参照するだけで、アカウント名・URL を二重に持たない（D-075）。
 */

export type SocialLink = {
  /** 表示の切り替えに使う識別子 */
  id: "instagram" | "note";
  /** サービス名。リンクの読み上げ名にも使う */
  label: string;
  /** アカウント名（例：`@kai.design22`）。お問い合わせ・プライバシーポリシーの DM の案内に表示する */
  handle: string;
  /** プロフィールの URL（クエリパラメータなし） */
  url: string;
};

/** 表示順：Instagram → note */
export const socialLinks: readonly SocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    handle: "@kai.design22",
    url: "https://www.instagram.com/kai.design22/",
  },
  {
    id: "note",
    label: "note",
    handle: "kai_design22",
    url: "https://note.com/kai_design22",
  },
];

/** Instagram のアカウント（SNS リンクと DM の窓口の両方で使う） */
export const instagramAccount = socialLinks.find((link) => link.id === "instagram")!;

/** note のプロフィール URL（Journal から使う） */
export const noteProfile = socialLinks.find((link) => link.id === "note")!;
