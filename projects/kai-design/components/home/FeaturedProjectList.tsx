import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/types/project";
import styles from "./FeaturedProjectList.module.css";

type FeaturedProjectListProps = {
  /** 並べる作品。並び順はこの配列の順番のまま */
  projects: readonly Project[];
};

/**
 * Home の Selected Projects 用の作品一覧（Server Component、D-067）。
 *
 * /projects と詳細ページの「他の制作実績」は従来どおり ProjectGrid（カードの2列）を使う。
 * Home だけ、作品画像を大きく見せる交互レイアウトにするため、この部品に分けた。
 *
 * ■ レイアウト
 * - スマホ・タブレット：作品ごとに縦並び（画像 → 区分・作品名 → 種別 → 紹介文 → 使用技術 → 「詳しく見る」）。
 * - 1024px 以上：画像 7・文字 5 の2列。1作品目は画像左・文字右、2作品目は文字左・画像右と交互にする。
 *   DOM の順序はどの作品も「画像 → 文字」のまま。左右の入れ替えは CSS（grid-template-areas）だけで行い、
 *   読み上げ・Tab キーの順序は変えない。
 * - 画像は外側の余白（gutter）まで伸ばす（Hero の画像と同じ表現）。画面の外へははみ出さない。
 *
 * ■ リンク
 * - リンク要素は作品名の1つだけ（ProjectCard と同じ方針）。作品名リンクの疑似要素（::after）を作品全体に広げ、
 *   画像や文字のどこを押しても詳細ページへ移動できるようにする。
 * - 「詳しく見る →」は押せることを示す表示。作品全体が作品名のリンクで押せるため、読み上げでは重複させない（aria-hidden）。
 *
 * ■ 動き（D-068）
 * - スクロール：画像（.media）と文字（.body）に data-reveal を付け、RevealOnScroll（app/page.tsx）が
 *   画面に入ったときに表示する。画像は下から少し移動しながら、文字は画像より少し遅れてフェードインする。
 *   文字（.body）は作品全体を覆うリンクの ::after を含むため、移動はさせずフェードだけにする（data-reveal="fade"）。
 *   JavaScript が無効のときや、動きを減らす設定のときは最初から表示される。
 * - ホバー・フォーカス：画像の軽い拡大と「詳しく見る」の矢印の移動。CSS だけで行う。
 *   作品全体は作品名リンクの ::after で覆われているため、起点は .project:hover と、
 *   キーボード操作時の .project:has(.link:focus-visible)。
 *
 * 「自主制作」と「架空企業／架空店舗」のラベルを必ず表示し、受託実績と誤認させない（仕様書 3章）。
 */
export default function FeaturedProjectList({ projects }: FeaturedProjectListProps) {
  return (
    <ol className={styles.list}>
      {projects.map((project, index) => {
        const { slug, title, kind, fictionLabel, summary, techs, thumbnail } = project;
        return (
          <li key={slug} className={styles.item}>
            <article className={styles.project}>
              <div className={styles.media} data-reveal>
                <Image
                  src={thumbnail.src}
                  alt={thumbnail.alt}
                  width={thumbnail.width}
                  height={thumbnail.height}
                  loading="lazy"
                  // 画像最適化が無効なため srcset は出力されないが、将来有効にしたときの表示幅の目安として残す
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className={styles.image}
                />
              </div>

              <div className={styles.body} data-reveal="fade" data-reveal-delay="1">
                <div className={styles.meta}>
                  {/* 作品の通し番号は装飾（順序は ol で伝わる）のため読み上げない */}
                  <span className={styles.index} lang="en" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <ul className={styles.labels} aria-label="作品の区分">
                    <li className={styles.label}>自主制作</li>
                    <li className={styles.label}>{fictionLabel}</li>
                  </ul>
                </div>

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

                <span className={styles.more} aria-hidden="true">
                  詳しく見る
                  <span className={styles.arrow}>→</span>
                </span>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
