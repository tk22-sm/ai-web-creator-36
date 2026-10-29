import Section from "@/components/ui/Section";
import styles from "./Approach.module.css";

type Step = {
  /** 英語の段階名（仕様書 6章） */
  name: string;
  /** 段階の要点（仕様書 6章） */
  focus: string;
  /** 説明文 */
  description: string;
};

/**
 * 制作で大切にしている考え方の3段階。
 * Home でしか使わない固定の文言のため、data/ には置かずこのファイル内で管理する。
 */
const steps: readonly Step[] = [
  {
    name: "Understand",
    focus: "背景と想い",
    description: "サービスが生まれた背景や、届けたい想いを丁寧に伺います。",
  },
  {
    name: "Discover",
    focus: "市場・競合・強み",
    description: "市場や競合を踏まえ、そのサービスならではの強みを見つけます。",
  },
  {
    name: "Deliver",
    focus: "適切な人へ価値を届ける",
    description: "見つけた価値が必要な人へ伝わるよう、構成とデザインに落とし込みます。",
  },
];

/**
 * Home の Approach（Server Component）。
 *
 * 理念（考え方）として説明し、実案件で実施した調査や成果と誤認させない（仕様書 6章）。
 * 信頼感を優先し、装飾は番号と区切り線だけに抑える（D-015）。
 * 順序に意味があるため <ol> で並べる。
 */
export default function Approach() {
  return (
    <Section
      id="approach"
      eyebrow="Approach"
      title="想いを理解し、価値を見つけ、必要な人へ届ける。"
      lead="Webサイト制作で大切にしている考え方です。"
    >
      <ol className={styles.list}>
        {steps.map((step, index) => (
          <li key={step.name} className={styles.step}>
            {/* 番号は <ol> の順序と重複するため読み上げない */}
            <span className={styles.number} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className={styles.name} lang="en">
              {step.name}
            </h3>
            <p className={styles.focus}>{step.focus}</p>
            <p className={styles.description}>{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
