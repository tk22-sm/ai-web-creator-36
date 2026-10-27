import type { Metadata, Viewport } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

/**
 * サイト全体の基本メタデータ。
 *
 * - title.template：各ページで title を指定すると「ページ名 | Kai Design」になる。
 *   template を使う場合、Next.js では default（下層で未指定のときの値）が必須。
 * - description は仮の文言（仕様書 6章 Hero の説明文をもとに作成）。正式な文言は STEP 6 で確定する。
 * - metadataBase・OGP はドメイン未確定のため未設定（仕様書 14章。STEP 6 で対応）。
 */
export const metadata: Metadata = {
  title: {
    default: "Kai Design | Webサイト制作のポートフォリオ",
    template: "%s | Kai Design",
  },
  description:
    "サービスの背景や価値を理解し、必要な人へ伝えるWebサイト制作。個人で活動するKai Designのポートフォリオサイトです。",
};

/**
 * ブラウザUIの色とカラースキーム。サイトはダーク基調のみ（仕様書 5章）。
 * Next.js 16 では viewport 関連の値は metadata ではなく viewport として書き出す。
 */
export const viewport: Viewport = {
  themeColor: "#111214",
  colorScheme: "dark",
};

/**
 * 全ページ共通のレイアウト。
 *
 * <main id="main"> をここで用意するため、各ページ（page.tsx）は <main> を書かず中身だけを返す。
 * スキップリンクはページ内で最初にフォーカスされる要素にし、キーボード利用者がナビを飛ばせるようにする。
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
