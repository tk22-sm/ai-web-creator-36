import styles from "./Hero.module.css";
import Link from "next/link";

export default function Hero() {
    return(
        <section className={styles.hero}>
            <h1 className={styles.title}>家族のこれからに、ちょうどいい家を。</h1>
            <p className={styles.description}>
                土地も、予算も、性能も。家族のこれからから、一緒に考える家づくり。
            </p>

            <Link href="/contact" className={styles.cta}>
                無料相談・来場予約
            </Link>
        </section>
    )
}