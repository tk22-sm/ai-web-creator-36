import { featuredProjects } from "@/data/projects";
import ProjectGrid from "@/components/projects/ProjectGrid";
import ButtonLink from "@/components/ui/ButtonLink";
import Section from "@/components/ui/Section";

/**
 * Home の Selected Projects（Server Component）。
 *
 * データの流れ：data/projects.ts の featuredProjects → ProjectGrid → ProjectCard
 * 作品が増えた場合は data 側の featured で Home に出す作品を絞り、全件は /projects（STEP 3）で見せる。
 *
 * リード文で「自主制作であり、実在の企業・店舗や受託案件ではない」ことを明示する（仕様書 3章・6章）。
 */
export default function SelectedProjects() {
  return (
    <Section
      id="projects"
      eyebrow="Selected Projects"
      title="自主制作"
      lead="架空の企業・店舗を想定して制作した自主制作の作品です。実在の企業・店舗や受託案件ではありません。"
      action={
        <ButtonLink href="/projects" variant="text">
          自主制作一覧を見る
        </ButtonLink>
      }
    >
      <ProjectGrid projects={featuredProjects} />
    </Section>
  );
}
