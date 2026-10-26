import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/common/BackToTop";

export const metadata: Metadata = {
  title: {
    default: "株式会社 木と日々 | 千葉の注文住宅・家づくり",
    template: "%s | 株式会社 木と日々",
  },
  description:
    "千葉県で家族の暮らしに寄り添う注文住宅をご提案。土地探しから資金計画、住まいづくりまで、株式会社 木と日々が丁寧にサポートします。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
