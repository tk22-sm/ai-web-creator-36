import { works } from "@/data/works";
import Image from "next/image";
import styles from "./page.module.css";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;

    const work = works.find((item) => item.slug === slug);

    if (!work) {
    return {
        title: "施工事例が見つかりません",
    };
    }

    return {
    title: work.title,
    description: `${work.title}の施工事例をご紹介。株式会社 木と日々の家づくりをご覧いただけます。`,
    };
}

export function generateStaticParams() {
  return works.map((work) => ({
    slug: work.slug,
  }));
}

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function WorkDetailPage({ params }: Props) {
    const { slug } = await params;
    const work = works.find((item) => item.slug === slug);
    if (!work) {
        notFound();
    }
    return (
        <main className={styles.main}>
            <p className={styles.area}>{work.area}</p>
            <h1 className={styles.title}>{work.title}</h1>
            <Image
                src={work.image}
                alt={work.title}
                width={work.imageWidth}
                height={work.imageHeight}
                sizes="(min-width: 1000px) 952px, calc(100vw - 48px)"
                className={styles.image}
            />
            <Link href="/works" className={styles.backLink}>
                ← 施工事例一覧へ戻る
            </Link>
        </main>
    );
}