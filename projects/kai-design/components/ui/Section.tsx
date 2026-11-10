import type { ReactNode } from "react";
import styles from "./Section.module.css";

type SectionProps = {
  /** セクションの id。ページ内リンク（例：`/#journal`）の移動先になる */
  id: string;
  /** 見出し上に添える英語のラベル（例：`Approach`）。英語は補助表現に限定する（仕様書 2章） */
  eyebrow: string;
  /** 日本語の見出し（h2） */
  title: ReactNode;
  /** 見出し下の説明文（任意） */
  lead?: ReactNode;
  /** 見出しエリアの右側（PC）／下側（スマホ）に置く要素。一覧へのリンクなど（任意） */
  action?: ReactNode;
  /**
   * セクションの上下の余白。
   * - default：標準（スマホ約72px〜PC約120px）。About・制作実績ページなどで使う
   * - compact：作品詳細など、文章を続けて読むページ用（STEP 3 で追加）
   * - feature：トップの主役のセクション（スマホ約72px〜PC約136px。D-065）
   * - tight：トップの補足のセクション（スマホ約56px〜PC約80px。D-065）
   * - band：中身の少ない帯。見出しと本文を横並びにする（スマホ約20px〜PC約28px。D-065）
   */
  spacing?: "default" | "compact" | "feature" | "tight" | "band";
  /** 背景。surface にすると既存の面の色（--color-surface）で区切る（D-065） */
  tone?: "default" | "surface";
  children: ReactNode;
};

/**
 * Home の各セクション共通の枠（Server Component）。
 *
 * 役割：
 * - <section> と見出し（h2）を aria-labelledby で関連付け、支援技術でセクション名を読み上げられるようにする。
 * - 最大幅・左右余白・セクション間隔を globals.css のトークンでそろえる。
 * - 「英語ラベル＋日本語見出し」の組み合わせを全セクションで統一する。
 *
 * Header / Footer は同じ max-width の指定をそれぞれ書いているが、Home は5セクションで
 * 同じ指定が必要になるため部品化した（decision-log.md D-016）。
 */
export default function Section({
  id,
  eyebrow,
  title,
  lead,
  action,
  spacing = "default",
  tone = "default",
  children,
}: SectionProps) {
  const headingId = `${id}-heading`;
  // default のときは追加クラスなし（トップ以外のページの見た目を変えないため）
  const className = [
    styles.section,
    spacing !== "default" && styles[spacing],
    tone === "surface" && styles.surface,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section id={id} className={className} aria-labelledby={headingId}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headingGroup}>
            <p className={styles.eyebrow} lang="en">
              {eyebrow}
            </p>
            <h2 id={headingId} className={styles.title}>
              {title}
            </h2>
            {lead && <p className={styles.lead}>{lead}</p>}
          </div>
          {action && <div className={styles.action}>{action}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
