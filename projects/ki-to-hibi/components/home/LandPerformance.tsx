import styles from "./LandPerformance.module.css";
import Link from "next/link";

export default function LandPerformance() {
    return (
        <section className={styles.section}>
            <h2 className={styles.title}>土地も、性能も。暮らしから考える。</h2>
            <div className={styles.grid}>
                <article className={styles.card}>
                    <Link href="/land" className={styles.cardLink}>
                        <span className={styles.cardLabel}>LAND</span>
                        <h3 className={styles.cardTitle}>
                            土地探しから、一緒に。
                        </h3>
                        <p className={styles.cardText}>
                            土地と建物を、総額から考える家づくり。
                        </p>
                    </Link>
                </article>
                <article className={styles.card}>
                    <Link href="/performance" className={styles.cardLink}>
                        <span className={styles.cardLabel}>PERFORMANCE</span>
                        <h3 className={styles.cardTitle}>
                            心地よさが、ずっと続く家。
                        </h3>
                        <p className={styles.cardText}>
                            断熱・耐震など、安心して暮らすための住まいの性能。
                        </p>
                    </Link>
                </article>
            </div>
        </section>
    )
}