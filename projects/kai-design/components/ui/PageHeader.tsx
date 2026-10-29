import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  /** 見出し上に添える英語のラベル（例：`Projects`） */
  eyebrow: string;
  /** ページの見出し（h1）。1ページに1つだけ */
  title: ReactNode;
  /** 見出し下の導入文（任意） */
  lead?: ReactNode;
  /** 見出しより上に置く要素。パンくずリストなど（任意） */
  before?: ReactNode;
  /** 導入文の下に置く要素。ラベルや注記など（任意） */
  children?: ReactNode;
};

/**
 * 下層ページの冒頭（Server Component）。
 *
 * Home の Section（h2）と同じ「英語ラベル＋日本語見出し」の組み合わせで、見出しだけ h1 にしたもの。
 * /projects・/projects/[slug]・404 で使い、STEP 4 の /about・/contact・/privacy でも再利用する想定。
 */
export default function PageHeader({ eyebrow, title, lead, before, children }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {before}
        <p className={styles.eyebrow} lang="en">
          {eyebrow}
        </p>
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children}
      </div>
    </header>
  );
}
