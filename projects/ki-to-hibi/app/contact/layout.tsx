import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "無料相談・来場予約",
  description:
    "株式会社 木と日々への家づくりのご相談はこちら。土地探しや資金計画、住まいづくりについてお気軽にお問い合わせください。",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}