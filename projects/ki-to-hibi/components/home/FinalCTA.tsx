import styles from "./FinalCTA.module.css";
import Link from "next/link";

export default function FinalCTA() {
    return (
        <section className={styles.cta}>
            <span className={styles.label}>CONTACT</span>
            <h2 className={styles.title}>家づくりの第一歩を、ここから。</h2>
            <p className={styles.text}>
                土地のことも、予算のことも。まだ何も決まっていなくても大丈夫です。
                まずはお気軽にご相談ください。
            </p>
            <Link href="/contact" className={styles.button}>無料相談・来場予約 →</Link>
        </section>
    )
}