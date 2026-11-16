import type { Metadata, Viewport } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/motion/PageTransition";
import RevealOnScroll from "@/components/motion/RevealOnScroll";
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
 * RevealOnScroll はスクロールに合わせた表示演出のきっかけを付ける部品で、画面には何も描画しない（D-069）。
 * 全ページで動かすため、ページごとではなくここに1つだけ置く。
 * PageTransition はサイト内のページ移動の演出（旧ページのフェードアウト → 新しいページのフェードイン）を
 * 行う部品で、画面には何も描画しない（D-070）。
 * <html> の data-scroll-behavior="smooth" は Next.js 16 の設定。サイトの CSS は scroll-behavior: smooth だが、
 * この属性があると、Next.js がページ移動のときだけ滑らかなスクロールを止め、先頭（または戻る・進むで元の位置）へ
 * すぐに移動する。同じページ内の # への移動は、従来どおり滑らかにスクロールする（D-070）。
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" data-scroll-behavior="smooth">
      <body>
        <a href="#main" className="skip-link">
          本文へスキップ
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <RevealOnScroll />
        <PageTransition />
      </body>
    </html>
  );
}
