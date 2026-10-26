import styles from "./About.module.css";
import Link from "next/link";

export default function About() {
    return (
        <section className={styles.about}>
            <span className={styles.label}>ABOUT US</span>
            <h2 className={styles.title}>
                家族のこれからに、寄り添う工務店。
            </h2>
            <p className={styles.text}>
                私たちは、千葉県東葛エリアを中心に、家族の暮らしに寄り添う住まいづくりを行っています。
            </p>
            <p className={styles.text}>
                家を建てるときも、建てたあとも。気軽に相談できる、身近な存在でありたいと考えています。
            </p>
            <Link href="/about" className={styles.link}>私たちについて →</Link>
        </section>
    )
}