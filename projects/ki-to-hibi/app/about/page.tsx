import styles from "./page.module.css"
import type { Metadata } from "next";
import ConsultationCTA from "@/components/common/ConsultationCTA";

export const metadata: Metadata = {
  title: "私たちについて",
  description:
    "株式会社 木と日々の家づくりへの想いや大切にしている考え方、会社情報をご紹介します。",
};

const values = [
    {
        id: 1,
        title: "暮らしやすさ",
        description: "家族の毎日に寄り添う設計を大切にします。",
    },
    {
        id: 2,
        title: "自然素材",
        description: "木のぬくもりを感じられる住まいを考えます。",
    },
    {
        id: 3,
        title: "安心できる家づくり",
        description: "相談から完成後まで、長く寄り添います。",
    },
];

export default function AboutPage() {
    return (
        <main className={styles.main}>
            <h1>木と日々について</h1>
            <p>家を建てる。その先の日々まで。</p>
            <section className={styles.philosophy}>
                <span className={styles.label}>OUR PHILOSOPHY</span>
                <h2>家を建てる。その先の日々まで。</h2>
                <p>
                    私たちが大切にしているのは、
                    家を建てることだけではありません。
                </p>
                <p>
                    家族が笑い、くつろぎ、毎日を心地よく過ごせること。
                    そんな暮らしを、家づくりを通して支えていきたいと考えています。
                </p>
            </section>
            <section className={styles.values}>
                <h2>私たちが大切にしていること</h2>

                <div className={styles.grid}>
                    {values.map((value) => (
                        <article key={value.id} className={styles.card}>
                            <h3 className={styles.cardTitle}>{value.title}</h3>
                            <p className={styles.cardDescription}>{value.description}</p>
                        </article>
                    ))}
                </div>
            </section>
            <section className={styles.company}>
                <h2>会社概要</h2>
                <dl className={styles.companyList}>
                    <dt>会社名</dt>
                    <dd>株式会社 木と日々</dd>
                    <dt>所在地</dt>
                    <dd>千葉県（架空の会社のため詳細未設定）</dd>
                    <dt>事業内容</dt>
                    <dd>注文住宅の設計・施工、土地探しサポート</dd>
                    <dt>対応エリア</dt>
                    <dd>千葉県東葛エリアを中心に対応</dd>
                </dl>
            </section>
            <ConsultationCTA
                title="私たちと、家づくりを始めませんか？"
                description="理想の暮らしや家づくりへの想いを、ぜひお聞かせください。"
            />
        </main>
    )
}