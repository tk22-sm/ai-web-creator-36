import styles from "./page.module.css"
import type { Metadata } from "next";
import ConsultationCTA from "@/components/common/ConsultationCTA";

export const metadata: Metadata = {
  title: "お金のこと",
  description:
    "株式会社 木と日々の家づくりに必要な費用や予算シミュレーションをご紹介。土地購入費、建物工事費、諸費用などをわかりやすく解説します。",
};

const costs = [
    {
        id: 1,
        title: "土地購入費",
        description: "土地の購入に必要な費用",
    },
    {
        id: 2,
        title: "建物工事費",
        description: "建物本体や付帯工事の費用",
    },
    {
        id: 3,
        title: "諸費用",
        description: "登記やローン手続きなど",
    },
    {
        id: 4,
        title: "入居後の費用",
        description: "税金や維持管理など",
    },
];

const budgetItems = [
    { id: 1, name: "土地購入費", amount: 2000 },
    { id: 2, name: "建物工事費", amount: 2400 },
    { id: 3, name: "諸費用・その他", amount: 400 },
];

export default function MoneyPage() {

    const totalBudget = budgetItems.reduce((sum, item) => {
        return sum + item.amount;
    }, 0);

    return (
        <main className={styles.main}>
            <h1>家づくりのお金について</h1>
            <p>
                土地代、建物代、諸費用、住宅ローン。
                家づくりに必要なお金を、わかりやすくご紹介します。
            </p>
            <section>
                <h2>家づくりに必要な4つの費用</h2>
                <div className={styles.grid}>
                    {costs.map((cost) => (
                        <article key={cost.id} className={styles.card}>
                            <h3 className={styles.cardTitle}>{cost.title}</h3>
                            <p className={styles.cardDescription}>{cost.description}</p>
                        </article>
                    ))}
                </div>
            </section>
            <section>
                <h2>予算シミュレーション例</h2>
                <p>総予算4,800万円の場合</p>
                <div className={styles.budget}>
                    {budgetItems.map((budgetItem) => (
                        <div key={budgetItem.id} className={styles.budgetRow}>
                            <p>{budgetItem.name}</p>
                            <p>{budgetItem.amount}万円</p>
                        </div>
                    ))}
                    <div className={styles.budgetTotal}>
                        <p>合計</p>
                        <p>{totalBudget.toLocaleString("ja-JP")}万円</p>
                    </div>
                </div>
                <p>
                    ※ 上記は架空の費用配分例です。
                    実際の費用は土地・建物・条件などによって異なります。
                </p>
            </section>
            <ConsultationCTA
                title="家づくりの予算、一緒に考えませんか？"
                description="土地探しから住宅ローンまで、ご家族に合った無理のない資金計画をご提案します。"
            />
        </main>
    )
}