import Link from "next/link";
import Image from "next/image";
import styles from "./Works.module.css";
import { works } from "@/data/works";

export default function Works() {
  return (
    <section className={styles.works}>
        <span className={styles.label}>WORKS</span>
        <h2 className={styles.title}>施工事例</h2>

        <div className={styles.grid}>
            {works.map((work) => (
                <article key={work.slug} className={styles.card}>
                    <Link href={`/works/${work.slug}`} className={styles.cardLink}>
                        <div className={styles.imageWrapper}>
                            <Image
                                src={work.image}
                                alt={work.title}
                                width={800}
                                height={600}
                                sizes="(min-width: 768px) 33vw, 100vw"
                                className={styles.image}
                            />
                        </div>
                        <p className={styles.area}>{work.area}</p>
                        <h3 className={styles.cardTitle}>{work.title}</h3>
                    </Link>
                </article>
            ))}
        </div>
        <Link href="/works" className={styles.moreLink}>
            施工事例をもっと見る →
        </Link>
    </section>
  );
}