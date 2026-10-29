import { getFictionNotice } from "@/data/projects";
import type { Project } from "@/types/project";
import styles from "./ProjectOverview.module.css";

type ProjectOverviewProps = {
  project: Project;
};

/**
 * 作品詳細の Overview（作品概要）を定義リスト（<dl>）で表示する（Server Component）。
 *
 * 「区分」「種別」「構成」「使用技術」の組み合わせなので、項目名と値の対応を表せる <dl> を使う。
 * 値はすべて Project の基本項目から作るため、ケーススタディの文章が無い作品でも必ず表示できる。
 * 公開サイトへのリンクは Links セクションにまとめ、ここには置かない（同じリンクの重複を避ける）。
 */
export default function ProjectOverview({ project }: ProjectOverviewProps) {
  const rows = [
    { term: "区分", detail: `自主制作（${project.fictionLabel}）` },
    { term: "種別", detail: project.kind },
    { term: "構成", detail: project.structure.join(" / ") },
    { term: "使用技術", detail: project.techs.join(" / ") },
  ];

  return (
    <div className={styles.overview}>
      {/* 架空案件であることを概要欄でも明示する（ページ冒頭と合わせて2か所） */}
      <p className={styles.notice}>{getFictionNotice(project)}</p>

      <dl className={styles.list}>
        {rows.map((row) => (
          <div key={row.term} className={styles.row}>
            <dt className={styles.term}>{row.term}</dt>
            <dd>{row.detail}</dd>
          </div>
        ))}
      </dl>

      {project.notes && (
        <ul className={styles.notes} aria-label="注記">
          {project.notes.map((note) => (
            <li key={note}>※ {note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
