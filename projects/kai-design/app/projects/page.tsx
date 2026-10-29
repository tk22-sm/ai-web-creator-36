import type { Metadata } from "next";
import ContactCta from "@/components/home/ContactCta";
import ProjectGrid from "@/components/projects/ProjectGrid";
import PageHeader from "@/components/ui/PageHeader";
import { projects } from "@/data/projects";
import styles from "./page.module.css";

/** title は layout.tsx の template により「制作実績 | Kai Design」になる */
export const metadata: Metadata = {
  title: "制作実績",
  description:
    "Kai Design の制作実績（自主制作）の一覧です。架空の企業・店舗を想定して制作したWebサイトで、実際の受託案件ではありません。",
};

/**
 * 制作実績の一覧ページ（/projects、Server Component）。
 *
 * データの流れ：data/projects.ts の projects（全件）→ ProjectGrid → ProjectCard
 * Home は featured の作品だけ、このページは全件を表示する。作品の追加は data/projects.ts だけで反映される。
 *
 * - h1 は「制作実績」（ナビゲーションの表記に合わせる。D-025）。
 * - 導入文で、自主制作の架空案件であり受託案件ではないことを明示する（仕様書 3章）。
 * - カードは h1 の直下に並ぶため、作品名の見出しを h2 にする。
 * - next dev で「1枚目の画像が LCP なのに遅延読み込みになっている」と警告が出たため、1行目を eager にした（D-027）。
 */
export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="制作実績"
        lead="架空の企業・店舗を想定して制作した、自主制作のWebサイトです。実在の企業・店舗や、実際の受託案件ではありません。作品ごとに、制作の背景や設計の工夫を紹介しています。"
      />

      <div className={styles.list}>
        {/* 1行目（PC で2件）はページを開いた直後に見えるため、画像をすぐに読み込む */}
        <ProjectGrid projects={projects} headingLevel="h2" eagerCount={2} />
      </div>

      <ContactCta />
    </>
  );
}
