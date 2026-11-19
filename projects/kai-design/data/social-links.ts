/**
 * Kai Design の SNS アカウント（ヘッダー・スマホメニュー・フッターのリンク、D-074）。
 *
 * - URL はこのファイルだけで管理する。表示箇所（components/layout/SocialLinks）はこの配列を読む。
 * - note のプロフィール URL は、Journal（data/articles.ts の noteProfileUrl）でもこの値を使う。
 * - お問い合わせの代わりの窓口（Instagram の DM）は data/contact-channels.ts で別に管理している。
 *   こちらは発信用のアカウントで、窓口とは役割が違う（D-074）。
 */

export type SocialLink = {
  /** 表示の切り替えに使う識別子 */
  id: "instagram" | "note";
  /** サービス名。リンクの読み上げ名にも使う */
  label: string;
  /** アカウント名（記録用） */
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

/** note のプロフィール URL（Journal から使う） */
export const noteProfile = socialLinks.find((link) => link.id === "note")!;
