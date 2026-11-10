/**
 * お問い合わせフォーム以外の連絡先（D-064）。
 *
 * - 通常の窓口はお問い合わせフォーム（/contact）。
 * - Instagram の DM は、フォームが準備中・利用できない場合の代わりの窓口。
 *   DM の受信テストは未実施のため、画面では「受信を確認済み」とは書かない。
 * - DM には個人情報や機密性の高い内容を書かず、まずは簡単な用件だけを送ってもらう。
 *
 * お問い合わせページ（ContactForm）とプライバシーポリシーの両方がこの値を使う。
 */

/** Kai Design の Instagram */
export const instagram = {
  /** 表示用のアカウント名 */
  handle: "@tk_wafh",
  /** プロフィールの URL */
  url: "https://www.instagram.com/tk_wafh/",
} as const;
