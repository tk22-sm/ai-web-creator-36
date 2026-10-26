import styles from "./page.module.css"
import { works } from "@/data/works";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "施工事例",
  description:
    "株式会社 木と日々の施工事例をご紹介。家族の暮らしに合わせた住まいづくりをご覧いただけます。",
};

export default function WorksPage(){
    return (
        <main className={styles.main}>
            <h1>施工事例</h1>
            <p>家族それぞれの暮らしに合わせた、木と日々の家づくりをご紹介します。</p>
            <div className={styles.grid}>
                {works.map((work) => (
                    <article key={work.slug} className={styles.card}>
                    <Link
                        href={`/works/${work.slug}`}
                        className={styles.cardLink}
                    >
                        <div className={styles.imageWrapper}>
                            <Image src={work.image}
                                alt={work.title}
                                fill
                                sizes="(min-width: 768px) 33vw, 100vw"
                                className={styles.image} 
                            />
                        </div>
                        <p className={styles.area}>{work.area}</p>
                        <h2 className={styles.cardTitle}>{work.title}</h2>
                    </Link>
                    </article>
                ))}
            </div>
        </main>
    )
}