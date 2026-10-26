import styles from "./Flow.module.css";

const steps = [
  {
    number: "01",
    title: "無料相談",
    text: "家づくりの希望や不安をお聞きします。",
  },
  {
    number: "02",
    title: "資金計画・土地探し",
    text: "予算と土地を一緒に考えます。",
  },
  {
    number: "03",
    title: "プラン・お見積もり",
    text: "暮らしに合った間取りと費用をご提案します。",
  },
  {
    number: "04",
    title: "ご契約・着工",
    text: "内容に納得いただいてから工事を進めます。",
  },
  {
    number: "05",
    title: "完成・お引き渡し",
    text: "新しい暮らしのスタートを迎えます。",
  },
];

export default function Flow() {
    return (
        <section className={styles.flow}>
            <span className={styles.label}>FLOW</span>
            <h2 className={styles.title}>家づくりの流れ</h2>
            <div className={styles.list}>
                {steps.map((step) => (
                    <article key={step.number} className={styles.step}>
                        <span className={styles.number}>{step.number}</span>
                        <h3 className={styles.stepTitle}>{step.title}</h3>
                        <p className={styles.stepText}>{step.text}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}