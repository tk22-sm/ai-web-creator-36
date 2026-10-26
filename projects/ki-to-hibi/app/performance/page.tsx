import styles from "./page.module.css";
import type { Metadata } from "next";
import ConsultationCTA from "@/components/common/ConsultationCTA";

export const metadata: Metadata = {
  title: "住宅性能",
  description:
    "株式会社 木と日々が大切にする住宅性能をご紹介。断熱・気密、耐震性能、省エネルギー、長く安心して暮らせる住まいづくりへの考え方をお伝えします。",
};

const performanceItems = [
    {
        id: 1,
        title: "断熱・気密",
        description: "季節を通じて快適に過ごせる室内環境を考えます。",
    },
    {
        id: 2,
        title: "耐震性能",
        description: "家族が安心して暮らせる住まいを目指します。",
    },
    {
        id: 3,
        title: "省エネルギー",
        description: "日々の光熱費にも配慮した家づくりを考えます。",
    },
    {
        id: 4,
        title: "長く住める家",
        description: "将来の維持管理や暮らしの変化にも目を向けます。",
    },
];

export default function PerformancePage() {
    return (
        <main className={styles.main}>
            <h1>心地よく、安心して暮らせる家。</h1>
            <p>
            毎日の快適さと、これから先の安心を考えた家づくり。
            </p>
            <section>
                <h2>木と日々が大切にする住宅性能</h2>
                <div className={styles.grid}>
                    {performanceItems.map((item) => (
                        <article key={item.id} className={styles.card}>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardDescription}>{item.description}</p>
                        </article>
                    ))}
                </div>
            </section>
            <ConsultationCTA
                title="家づくりの性能について、もっと詳しく。"
                description="断熱・耐震・省エネなど、気になることをお気軽にご相談ください。"
            />
        </main>
    );
}