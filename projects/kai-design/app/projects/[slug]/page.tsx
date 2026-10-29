import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import CaseStudyContent from "@/components/projects/CaseStudyContent";
import ProjectGrid from "@/components/projects/ProjectGrid";
import ProjectOverview from "@/components/projects/ProjectOverview";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ButtonLink from "@/components/ui/ButtonLink";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import { getFictionNotice, getProjectBySlug, projects } from "@/data/projects";
import type { CaseStudy } from "@/types/project";
import styles from "./page.module.css";

/**
 * 制作実績の詳細ページ（/projects/[slug]、Server Component）。
 *
 * ■ 静的書き出し（output: "export"）での動き
 * 1. next build の最初に generateStaticParams が呼ばれ、作品の slug 一覧を返す。
 * 2. slug ごとに generateMetadata と ProjectDetailPage が実行され、
 *    out/projects/ki-to-hibi.html のような HTML ファイルが作られる。
 * 3. 公開後はサーバーで処理を行わず、この HTML をそのまま配信する。
 *
 * ■ データの流れ
 * data/projects.ts（projects 配列）→ generateStaticParams（slug 一覧）
 * → params.slug → getProjectBySlug → 各セクション（Overview・CaseStudyContent・Links）
 */

/**
 * generateStaticParams で返していない slug へのアクセスを 404 にする。
 * 静的書き出しでは「リクエスト時に新しいページを作る」ことができない（dynamicParams: true は非対応）ため、
 * false を明示して、ビルド時に作ったページだけが存在することをコード上でも表す。
 */
export const dynamicParams = false;

/**
 * ビルド時に作成する詳細ページの一覧を返す。
 *
 * @returns `[{ slug: "ki-to-hibi" }, { slug: "mellow-coffee" }]` のような配列。
 *   各オブジェクトのキー名（slug）は、フォルダ名 [slug] と一致させる。
 */
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

/**
 * 作品ごとの title・description を作る。
 * title は layout.tsx の template により「作品名（自主制作） | Kai Design」になる。
 *
 * @param props.params ルートのパラメーター。Next.js 16 では Promise なので await して取り出す
 */
export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: `${project.title}（自主制作）`,
    description: `${project.kind}。${project.summary}${getFictionNotice(project)}`,
  };
}

/**
 * ケーススタディの各項目の表示設定（仕様書 7章の順序）。
 * key は CaseStudy 型のキー。データに値がある項目だけを描画する。
 * `satisfies` で「key が CaseStudy のキーであること」を型チェックしつつ、配列の型は狭いまま保つ。
 */
const caseStudySections = [
  { key: "background", eyebrow: "Background", title: "制作の背景と目的" },
  { key: "target", eyebrow: "Target", title: "想定したターゲットと課題" },
  { key: "design", eyebrow: "Design", title: "情報設計・UIの工夫" },
  { key: "development", eyebrow: "Development", title: "実装の工夫" },
  { key: "quality", eyebrow: "Quality", title: "確認したこと" },
  { key: "reflection", eyebrow: "Reflection", title: "学びと今後の課題" },
] as const satisfies readonly { key: keyof CaseStudy; eyebrow: string; title: string }[];

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  // dynamicParams = false のため通常はここに来ないが、notFound() で処理を止めることで、
  // 以降の project が undefined でない（Project 型である）と TypeScript に伝わる。
  if (!project) notFound();

  const otherProjects = projects.filter((item) => item.slug !== project.slug);

  return (
    <>
      <PageHeader
        eyebrow="Case Study"
        title={project.title}
        lead={project.kind}
        before={
          <Breadcrumb items={[{ label: "制作実績", href: "/projects" }, { label: project.title }]} />
        }
      >
        <ul className={styles.labels} aria-label="作品の区分">
          <li className={styles.label}>自主制作</li>
          <li className={styles.label}>{project.fictionLabel}</li>
        </ul>
        <p className={styles.summary}>{project.summary}</p>
        {/* 架空案件であることをページ冒頭で明示する（Overview にも同じ文言を表示） */}
        <p className={styles.notice}>{getFictionNotice(project)}</p>
      </PageHeader>

      <div className={styles.visual}>
        <div className={styles.frame}>
          <Image
            src={project.thumbnail.src}
            alt={project.thumbnail.alt}
            width={project.thumbnail.width}
            height={project.thumbnail.height}
            // ページ上部の主要画像のため、遅延読み込みせず優先して取得する（D-020）
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1296px) 1200px, 100vw"
            className={styles.image}
          />
        </div>
      </div>

      <Section id="overview" eyebrow="Overview" title="作品概要" spacing="compact">
        <ProjectOverview project={project} />
      </Section>

      {caseStudySections.map(({ key, eyebrow, title }) => {
        const block = project.caseStudy[key];
        // 内容が確認できていない項目は、見出しごと表示しない（仕様書 7章）
        if (!block) return null;
        return (
          <Section key={key} id={key} eyebrow={eyebrow} title={title} spacing="compact">
            <CaseStudyContent block={block} />
          </Section>
        );
      })}

      <Section id="links" eyebrow="Links" title="リンク" spacing="compact">
        <div className={styles.links}>
          <ButtonLink href={project.siteUrl} variant="secondary" external>
            公開サイトを見る
          </ButtonLink>
          <p className={styles.url}>{project.siteUrl}</p>
        </div>
      </Section>

      {otherProjects.length > 0 && (
        <Section
          id="other-projects"
          eyebrow="More Projects"
          title="他の制作実績"
          spacing="compact"
          action={
            <ButtonLink href="/projects" variant="text">
              制作実績一覧へ戻る
            </ButtonLink>
          }
        >
          <ProjectGrid projects={otherProjects} />
        </Section>
      )}
    </>
  );
}
