import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ButtonLink.module.css";

type ButtonLinkProps = {
  /** サイト内のリンク先 */
  href: string;
  /**
   * 見た目の種類。
   * - primary：塗りつぶし（ページ内で最も優先したい操作。1画面に1つを目安）
   * - secondary：枠線のみ
   * - text：文字＋矢印（一覧・詳細ページへの導線）
   */
  variant?: "primary" | "secondary" | "text";
  children: ReactNode;
};

/**
 * ボタンの見た目をしたサイト内リンク（Server Component）。
 *
 * 押すとページを移動するため、<button> ではなく <a>（next/link）で作る。
 * 見た目・フォーカス表示・ホバー時の矢印の動きをこの部品にまとめ、
 * Hero・Selected Projects・About・Contact の CTA でそろえる。
 */
export default function ButtonLink({ href, variant = "primary", children }: ButtonLinkProps) {
  return (
    <Link href={href} className={`${styles.button} ${styles[variant]}`}>
      <span>{children}</span>
      {/* 矢印は装飾のため読み上げない */}
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </Link>
  );
}
