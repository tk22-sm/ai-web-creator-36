import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";
import styles from "./ProjectCard.module.css";

type ProjectCardProps = {
  project: Project;
  /**
   * 作品名の見出しレベル（STEP 3 で追加）。
   * - h3（既定）：Home など、h2 のセクション内に置く場合
   * - h2：/projects のように、ページの h1 の直下に並べる場合
   * 見出しレベルを飛ばさない（h1 → h3 にしない）ことで、見出しの階層を正しく保つ。
   */
  headingLevel?: "h2" | "h3";
  /**
   * 画像の読み込み方（STEP 3 で追加）。
   * - lazy（既定）：画面に近づいてから読み込む
   * - eager：すぐに読み込む。ページを開いた直後に見える位置のカード（/projects の1行目）で使う
   */
  imageLoading?: "eager" | "lazy";
};

/**
 * 自主制作1件分のカード（Server Component）。
 *
 * データの流れ：data/projects.ts → ProjectGrid（Home・/projects・詳細ページの「他の制作実績」）→ project props → このカード
 *
 * - 「自主制作」と「架空企業／架空店舗」のラベルを必ず表示し、受託実績と誤認させない（仕様書 3章）。
 * - カード全体を押せるようにしつつ、リンク要素は作品名の1つだけにする。
 *   カード全体を <a> で囲むと、読み上げ時にカード内の全文がリンク名になり長くなるため、
 *   作品名のリンクの疑似要素（::after）をカード全体に広げている。
 * - リンク先は詳細ページ（/projects/[slug]）。
 */
export default function ProjectCard({
  project,
  headingLevel = "h3",
  imageLoading = "lazy",
}: ProjectCardProps) {
  const { slug, title, kind, fictionLabel, summary, techs, thumbnail } = project;
  // JSX では小文字で始まる名前は HTML タグ名そのもの（<headingLevel> というタグ）と解釈されるため、
  // 大文字で始まる変数に入れて「変数の値（"h2" / "h3"）をタグとして使う」と伝える

  const Heading = headingLevel;

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image
          src={thumbnail.src}
          alt={thumbnail.alt}
          width={thumbnail.width}
          height={thumbnail.height}
          loading={imageLoading}
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

        <Heading className={styles.title}>
          <Link href={`/projects/${slug}`} className={styles.link}>
            {title}
          </Link>
        </Heading>
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
