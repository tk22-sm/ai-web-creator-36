import styles from "./Concept.module.css";


export default function Concept() {
    return (
        <section className={styles.concept}>
            <span className={styles.label}>CONCEPT</span>
            <h2 className={styles.title}>家を建てる。その先の日々まで。</h2>
            <p className={styles.text}>
                私たちが考えるのは、家を建てることだけではありません。
                <br className={styles.pcBreak} />
                土地のこと、予算のこと、これからの暮らしのこと。
                <br className={styles.pcBreak} />
                家族が無理なく、心地よく暮らし続けられる住まいを、一緒に考えます。
            </p>
        </section>
    )
}