import Image from "next/image";
import {
  featuredProjects,
  getProjectBySlug,
  HERO_PROJECT_SLUG,
  HERO_SUB_PROJECT_SLUG,
} from "@/data/projects";
import ButtonLink from "@/components/ui/ButtonLink";
import styles from "./Hero.module.css";

/**
 * Home の Hero（Server Component）。
 *
 * - h1 はページの主題となる日本語コピー。英語コピーは補助表示（仕様書 2章・6章）。
 * - 大胆さは文字サイズと余白の対比で出し、装飾は増やさない（D-015）。
 * - 代表作品は data/projects.ts の HERO_PROJECT_SLUG で選ぶ。作品名・画像パスはこのファイルに書かない。
 * - 作品の画像には「自主制作」と作品の種別をキャプションで示し、実在店舗・受託実績と誤認させない。
 * - 成果の数値などは表示しない。
 *
 * ■ レイアウト（D-066）
 * - DOM の順序は キャッチコピー → 作品画像 → 説明文・ボタン。スマホではこの順に縦に並ぶ。
 * - 1024px 以上では、左列にキャッチコピーと説明文、右列に作品画像を置く（grid-template-areas）。
 *   画面の高さいっぱいには広げず、内容の高さで Hero を終える。
 * - 1024px 以上でだけ、代表作品（MELLOW COFFEE）に2つ目の作品（HERO_SUB_PROJECT_SLUG）を小さく重ねる。
 *   スマホでは代表作品だけを大きく見せる。2つ目の画像とキャプションは CSS の display: none で隠す
 *   （loading="lazy" のため、隠れている間は画像を読み込まない）。
 * - 「Scroll / Selected Works 02」は下に作品が続くことを示す装飾。読み上げでは不要なため aria-hidden にする。
 * - 画像は width / height 指定の next/image を使う（fill は style 属性を出し、CSP の生成が止まるため使わない）。
 * - フェードなどの動きは後続の PR で追加する。
 */
export default function Hero() {
  const project = getProjectBySlug(HERO_PROJECT_SLUG);
  const subProject = getProjectBySlug(HERO_SUB_PROJECT_SLUG);
  const worksCount = String(featuredProjects.length).padStart(2, "0");

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow} lang="en">
            Design with purpose.
          </p>
          <h1 id="hero-heading" className={styles.title}>
            <span className={styles.phrase}>伝えるべきことを、</span>
            <span className={styles.phrase}>伝わるデザインに。</span>
          </h1>
        </div>

        {project && (
          <figure className={styles.visual}>
            <div className={styles.media}>
              <div className={styles.mainFrame}>
                <Image
                  src={project.thumbnail.src}
                  alt={project.thumbnail.alt}
                  width={project.thumbnail.width}
                  height={project.thumbnail.height}
                  loading="eager"
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className={styles.image}
                />
              </div>
              {subProject && (
                <div className={styles.subFrame}>
                  <Image
                    src={subProject.thumbnail.src}
                    alt={subProject.thumbnail.alt}
                    width={subProject.thumbnail.width}
                    height={subProject.thumbnail.height}
                    loading="lazy"
                    sizes="20vw"
                    className={styles.image}
                  />
                </div>
              )}
            </div>
            <figcaption className={styles.caption}>
              <span className={styles.captionLine}>
                自主制作：{project.title}（{project.kind}）
              </span>
              {subProject && (
                <span className={`${styles.captionLine} ${styles.captionSub}`}>
                  自主制作：{subProject.title}（{subProject.kind}）
                </span>
              )}
            </figcaption>
          </figure>
        )}

        <div className={styles.body}>
          <p className={styles.description}>
            サービスの背景や価値を理解し、必要な人へ伝えるWebサイト制作。
          </p>
          <p className={styles.note}>個人でWebサイトの制作・コーディングを行っています。</p>
          <div className={styles.actions}>
            <ButtonLink href="/projects">作品一覧を見る</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              お問い合わせ
            </ButtonLink>
          </div>
          <p className={styles.scroll} lang="en" aria-hidden="true">
            Scroll / Selected Works {worksCount}
          </p>
        </div>
      </div>
    </section>
  );
}
