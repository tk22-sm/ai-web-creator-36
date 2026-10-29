import type { Project } from "@/types/project";
import ProjectCard from "./ProjectCard";
import styles from "./ProjectGrid.module.css";

type ProjectGridProps = {
  /** 並べる作品。並び順はこの配列の順番のまま */
  projects: readonly Project[];
  /** 各カードの作品名の見出しレベル（ProjectCard にそのまま渡す） */
  headingLevel?: "h2" | "h3";
  /**
   * 先頭から何件の画像をすぐに読み込むか（既定 0 = すべて遅延読み込み）。
   * ページを開いた直後に見える1行目（PC で2件）を指定すると、
   * 最も大きく表示される画像（LCP）の表示が遅れるのを防げる。
   */
  eagerCount?: number;
};

/**
 * 作品カードの一覧（Server Component）。
 *
 * Home の Selected Projects、/projects、詳細ページの「他の制作実績」で同じ並べ方を使うため、
 * STEP 2-B で SelectedProjects に書いていたグリッドをこの部品に切り出した（D-027）。
 * スマホ 1列 / 768px 以上 2列。作品が増えても行が増えるだけで、レイアウトの変更は不要。
 */
export default function ProjectGrid({ projects, headingLevel, eagerCount = 0 }: ProjectGridProps) {
  return (
    <ul className={styles.list}>
      {projects.map((project, index) => (
        <li key={project.slug} className={styles.item}>
          <ProjectCard
            project={project}
            headingLevel={headingLevel}
            imageLoading={index < eagerCount ? "eager" : "lazy"}
          />
        </li>
      ))}
    </ul>
  );
}
