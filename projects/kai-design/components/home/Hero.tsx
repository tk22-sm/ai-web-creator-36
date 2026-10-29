import Image from "next/image";
import { getProjectBySlug, HERO_PROJECT_SLUG } from "@/data/projects";
import ButtonLink from "@/components/ui/ButtonLink";
import styles from "./Hero.module.css";

/**
 * Home の Hero（Server Component）。
 *
 * - h1 はページの主題となる日本語コピー。英語コピーは補助表示（仕様書 2章・6章）。
 * - 大胆さは文字サイズと余白の対比で出し、装飾は増やさない（D-015）。
 * - 代表作品は data/projects.ts の HERO_PROJECT_SLUG で選ぶ。作品名・画像パスはこのファイルに書かない。
 * - 代表作品の画像には「自主制作」と作品の種別をキャプションで示し、実在店舗・受託実績と誤認させない。
 * - 成果の数値などは表示しない。
 * - フェードなどの動きは STEP 5 で追加する。
 */
export default function Hero() {
  const project = getProjectBySlug(HERO_PROJECT_SLUG);

  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={styles.inner}>
        <div className={styles.text}>
          <p className={styles.eyebrow} lang="en">
            Design with purpose.
          </p>
          {/* 各句を inline-block にし、句の途中で改行されないようにする */}
          <h1 id="hero-heading" className={styles.title}>
            <span className={styles.phrase}>伝えるべきことを、</span>
            <span className={styles.phrase}>伝わるデザインに。</span>
          </h1>
          <p className={styles.description}>
            サービスの背景や価値を理解し、必要な人へ伝えるWebサイト制作。
          </p>
          <p className={styles.note}>個人でWebサイトの制作・コーディングを行っています。</p>

          <div className={styles.actions}>
            <ButtonLink href="/projects">制作実績を見る</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              お問い合わせ
            </ButtonLink>
          </div>
        </div>

        {project && (
          <figure className={styles.visual}>
            <div className={styles.frame}>
              <Image
                src={project.thumbnail.src}
                alt={project.thumbnail.alt}
                width={project.thumbnail.width}
                height={project.thumbnail.height}
                // ファーストビューの主要画像のため、遅延読み込みせず優先して取得する。
                // Next.js 16 では priority が非推奨になり、loading / fetchPriority の指定が推奨されている。
                loading="eager"
                fetchPriority="high"
                sizes="(min-width: 1024px) 55vw, 100vw"
                className={styles.image}
              />
            </div>
            <figcaption className={styles.caption}>
              自主制作：{project.title}（{project.kind}）
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
