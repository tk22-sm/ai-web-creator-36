import styles from "./Money.module.css";
import Link from "next/link";

export default function Money() {
    return(
        <section className={styles.money}>
            <span className={styles.label}>MONEY</span>
            <h2 className={styles.title}>
                家づくりのお金を、わかりやすく。
            </h2>
            <p className={styles.text}>
                土地代、建物代、諸費用、住宅ローン。<br />
                家づくりに必要なお金を整理しながら、ご家族のこれからの暮らしに合った資金計画を一緒に考えます。
            </p>
            <Link href="/money" className={styles.link}>
                家づくりのお金を知る →
            </Link>
        </section>
    )
}