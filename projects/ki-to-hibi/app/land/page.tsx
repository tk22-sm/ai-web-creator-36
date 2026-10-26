import styles from "./page.module.css"
import type { Metadata } from "next";
import ConsultationCTA from "@/components/common/ConsultationCTA";

export const metadata: Metadata = {
  title: "土地探し",
  description:
    "株式会社 木と日々の土地探しサポートをご紹介。希望エリアや総予算、暮らしに合わせた土地選びをお手伝いします。",
};

const landPoints = [
    {
        id: 1,
        title: "エリアと暮らし",
        description: "通勤・通学や買い物、子育て環境など、日々の暮らしからエリアを考えます。",
    },
    {
        id: 2,
        title: "土地と建物の総予算",
        description: "土地代だけでなく、建物や諸費用も含めた無理のない予算を考えます。",
    },
    {
        id: 3,
        title: "土地の条件",
        description: "日当たりや道路、建築に関する法規制などを確認します。",
    },
];

export default function LandPage() {
    return (
        <main className={styles.main}>
            <h1>土地探しから、一緒に。</h1>
            <p>希望のエリアや予算、これからの暮らしに合わせて、土地探しから家づくりをサポートします。</p>
            <section>
                <h2>土地探しで大切な3つのポイント</h2>
                <div className={styles.grid}>
                    {landPoints.map((point) => (
                        <article key={point.id} className={styles.card}>
                            <h3 className={styles.cardTitle}>{point.title}</h3>
                            <p className={styles.cardDescription}>{point.description}</p>
                        </article>
                    ))}
                </div>
            </section>
            <section className={styles.support}>
                <span className={styles.label}>LAND SUPPORT</span>
                <h2>土地探しから、家づくりまで。</h2>
                <p>
                    木と日々では、土地探しと建物の計画を別々に考えるのではなく、
                    ご家族の暮らしと総予算に合わせて一緒に進めます。
                </p>
                <div className={styles.supportList}>
                    <article className={styles.supportItem}>
                        <h3 className={styles.supportTitle}>希望エリアの整理</h3>
                        <p className={styles.supportDescription}>
                            通勤・通学、生活環境などから検討します。
                        </p>
                    </article>
                    <article className={styles.supportItem}>
                        <h3 className={styles.supportTitle}>総予算の確認</h3>
                        <p className={styles.supportDescription}>
                            土地と建物の費用を合わせて検討します。
                        </p>
                    </article>
                    <article className={styles.supportItem}>
                        <h3 className={styles.supportTitle}>建築プランとの相性確認</h3>
                        <p className={styles.supportDescription}>
                            希望する家が建てられる土地か確認します。
                        </p>
                    </article>
                </div>
            </section>
            <ConsultationCTA
            title="土地探しから、お気軽にご相談ください。"
            description="希望のエリアや予算がまだ決まっていなくても大丈夫。ご家族のこれからの暮らしを、一緒に考えます。"
            />
        </main>
    )
}