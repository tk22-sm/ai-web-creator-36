import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";
import styles from "./ProjectCard.module.css";

type ProjectCardProps = {
  project: Project;
};

/**
 * 自主制作1件分のカード（Server Component）。
 *
 * データの流れ：data/projects.ts → SelectedProjects（Home）→ project props → このカード
 * STEP 3 の一覧ページ（/projects）でも同じカードを使う想定。
 *
 * - 「自主制作」と「架空企業／架空店舗」のラベルを必ず表示し、受託実績と誤認させない（仕様書 3章）。
 * - カード全体を押せるようにしつつ、リンク要素は作品名の1つだけにする。
 *   カード全体を <a> で囲むと、読み上げ時にカード内の全文がリンク名になり長くなるため、
 *   作品名のリンクの疑似要素（::after）をカード全体に広げている。
 * - リンク先の詳細ページ（/projects/[slug]）は STEP 3 で作る。それまではリンク先が存在しない。
 */
export default function ProjectCard({ project }: ProjectCardProps) {
  const { slug, title, kind, fictionLabel, summary, techs, thumbnail } = project;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image
          src={thumbnail.src}
          alt={thumbnail.alt}
          width={thumbnail.width}
          height={thumbnail.height}
          // 画像最適化が無効なため srcset は出力されないが、将来有効にしたときの表示幅の目安として残す
          sizes="(min-width: 768px) 50vw, 100vw"
          className={styles.image}
        />
      </div>

      <div className={styles.body}>
        <ul className={styles.labels} aria-label="作品の区分">
          <li className={styles.label}>自主制作</li>
          <li className={styles.label}>{fictionLabel}</li>
        </ul>

        <h3 className={styles.title}>
          <Link href={`/projects/${slug}`} className={styles.link}>
            {title}
          </Link>
        </h3>
        <p className={styles.kind}>{kind}</p>
        <p className={styles.summary}>{summary}</p>

        <ul className={styles.techs} aria-label="使用技術">
          {techs.map((tech) => (
            <li key={tech} className={styles.tech} lang="en">
              {tech}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
