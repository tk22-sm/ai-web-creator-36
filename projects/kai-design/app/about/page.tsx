import type { Metadata } from "next";
import ContactCta from "@/components/home/ContactCta";
import ButtonLink from "@/components/ui/ButtonLink";
import PageHeader from "@/components/ui/PageHeader";
import Section from "@/components/ui/Section";
import {
  experiences,
  profileIntroduction,
  services,
  servicesLead,
  skillGroups,
} from "@/data/profile";
import styles from "./page.module.css";

/** title は layout.tsx の template により「私について | Kai Design」になる */
export const metadata: Metadata = {
  title: "私について",
  description:
    "Kai Designのプロフィールです。業務システムの開発に携わるエンジニアとして働きながら、個人でWebサイトの制作に取り組んでいます。",
};

/**
 * About ページ（/about、Server Component）。
 *
 * 構成（仕様書 9章の4領域）：Profile → Experience → Skills → What I Can Do → 制作実績への導線 → お問い合わせ
 * データの流れ：data/profile.ts → このページ（Profile は PageHeader の中、他は Section ごと）
 *
 * - h1「私について」の直後に Profile（本人の3段落）を置き、重複する導入文は書かない（D-036）。
 * - Experience は本業の経験、What I Can Do は Kai Design として個人で提供するサービス。
 *   両者を混同させないよう、見出しと What I Can Do のリード文（「Kai Designとして、個人で」）で主語を書き分ける（D-038・D-041）。
 * - 開閉などの操作が無いため、すべて Server Component。
 */
export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="私について">
        <div className={styles.profile}>
          {profileIntroduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </PageHeader>

      <Section
        id="experience"
        eyebrow="Experience"
        title="経歴"
        lead="エンジニアとして、業務システムの開発から要件定義・テスト推進まで、幅広い工程に携わっています。"
        spacing="compact"
      >
        {/* 時期と内容の組み合わせなので定義リストで書く（専用の年表部品は作らない。D-038） */}
        <dl className={styles.definitionList}>
          {experiences.map((item) => (
            <div key={item.description} className={styles.row}>
              <dt className={styles.term}>{item.term}</dt>
              <dd>{item.description}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        id="skills"
        eyebrow="Skills"
        title="スキル"
        lead="Webサイト制作で使用している技術・ツールです。"
        spacing="compact"
      >
        <dl className={styles.definitionList}>
          {skillGroups.map((group) => (
            <div key={group.label} className={styles.row}>
              <dt className={styles.term}>{group.label}</dt>
              <dd>
                <ul className={styles.skills}>
                  {group.items.map((item) => (
                    <li key={item} lang="en">
                      {item}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        id="services"
        eyebrow="What I Can Do"
        title="対応できること"
        lead={servicesLead}
        spacing="compact"
      >
        <ul className={styles.services}>
          {services.map((service) => (
            <li key={service.title} className={styles.service}>
              <h3 className={styles.serviceTitle}>{service.title}</h3>
              <p className={styles.serviceDescription}>{service.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="about-projects"
        eyebrow="Projects"
        title="制作実績"
        lead="架空の企業・店舗を想定して制作した、自主制作の作品を紹介しています。"
        spacing="compact"
      >
        <ButtonLink href="/projects" variant="secondary">
          自主制作の作品を見る
        </ButtonLink>
      </Section>

      <ContactCta />
    </>
  );
}
