import styles from "./Promises.module.css";

const promises = [
    {
        number: "01",
        title: "無理のない資金計画",
        text: "建てた後の暮らしまで考えた予算をご提案します。",
    },
    {
        number: "02",
        title: "土地から一緒に考える",
        text: "土地と建物を別々ではなく、総額から考えます。",
    },
    {
        number: "03",
        title: "暮らしを支える性能",
        text: "断熱・耐震など、長く安心して暮らすための性能を大切にします。",
    }
];

export default function Promises() {
  return (
    <section className={styles.promises}>
      <span className={styles.label}>OUR PROMISES</span>
      <h2 className={styles.title}>家づくりで、大切にしていること。</h2>
      <div className={styles.grid}>
        {promises.map((promise) => (
            <article key={promise.number} className={styles.card}>
                <span className={styles.number}>
                    {promise.number}
                </span>
                <h3 className={styles.cardTitle}>{promise.title}</h3>
                <p className={styles.cardText}>{promise.text}</p>
            </article>
        ))}
      </div>
    </section>
  );
}