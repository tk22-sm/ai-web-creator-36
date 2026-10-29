import ButtonLink from "@/components/ui/ButtonLink";
import Section from "@/components/ui/Section";
import styles from "./AboutPreview.module.css";

type Fact = {
  /** 項目名 */
  term: string;
  /** 内容（複数行に分けたい場合は配列で渡す） */
  details: readonly string[];
};

/**
 * 経歴・スキルの要約（仕様書 2章の範囲だけで記載する）。
 * - 顧客名・案件の詳細など機密情報は書かない。
 * - 熟練度を誇張する表現（「得意」「プロ級」など）は使わない。
 * - 氏名・写真は未確定のため表示しない（仕様書 14章）。
 */
const facts: readonly Fact[] = [
  {
    term: "経験",
    details: ["業務システムの開発・設計・テスト（2021年4月〜）", "要件定義・テスト推進（2026年4月〜）"],
  },
  {
    term: "学習",
    details: ["UI/UXデザインスクールで6か月間学習・制作", "Figma / Illustrator / Photoshop"],
  },
  {
    term: "技術",
    details: ["HTML / CSS / JavaScript", "React / Next.js / TypeScript"],
  },
];

/**
 * Home の About（Server Component）。
 *
 * トップでは要約だけを見せ、詳細は /about（STEP 4）へ誘導する（仕様書 6章）。
 * 信頼感を優先し、装飾を抑えたテキスト中心の2列レイアウトにする（D-015）。
 * 項目名と内容の組み合わせなので、右列は定義リスト（<dl>）で書く。
 */
export default function AboutPreview() {
  return (
    <Section id="about" eyebrow="About" title="私について">
      <div className={styles.grid}>
        <div className={styles.summary}>
          <p>
            2021年からシステムエンジニアとして、業務システムの開発・設計・テストに携わってきました。2026年4月からは要件定義やテスト推進にも取り組んでいます。
          </p>
          <p>開発の現場で培った設計と確認の視点を、Webサイト制作に活かしています。</p>
          <div className={styles.action}>
            <ButtonLink href="/about" variant="text">
              詳しいプロフィールを見る
            </ButtonLink>
          </div>
        </div>

        <dl className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact.term} className={styles.fact}>
              <dt className={styles.term}>{fact.term}</dt>
              <dd className={styles.details}>
                {fact.details.map((detail) => (
                  <span key={detail} className={styles.detail}>
                    {detail}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
