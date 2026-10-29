import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ButtonLink.module.css";

type ButtonLinkProps = {
  /** リンク先。サイト内のパス、または external のときは外部URL */
  href: string;
  /**
   * 見た目の種類。
   * - primary：塗りつぶし（ページ内で最も優先したい操作。1画面に1つを目安）
   * - secondary：枠線のみ
   * - text：文字＋矢印（一覧・詳細ページへの導線）
   */
  variant?: "primary" | "secondary" | "text";
  /**
   * true のとき外部サイトへのリンクとして新しいタブで開く（STEP 3 で追加）。
   * 新しいタブで開くことを、矢印（↗）と読み上げ用テキストの両方で伝える。
   */
  external?: boolean;
  children: ReactNode;
};

/**
 * ボタンの見た目をしたリンク（Server Component）。
 *
 * 押すとページを移動するため、<button> ではなく <a> で作る。
 * - サイト内リンク：next/link（ページ遷移が速く、先読みも効く）
 * - 外部リンク：通常の <a>。rel="noopener noreferrer" で、開いた先のページから
 *   このページを操作されないようにする。
 * 見た目・フォーカス表示・ホバー時の矢印の動きをこの部品にまとめ、全ページの CTA をそろえる。
 */
export default function ButtonLink({
  href,
  variant = "primary",
  external = false,
  children,
}: ButtonLinkProps) {
  const className = `${styles.button} ${styles[variant]}`;

  if (external) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        <span>{children}</span>
        <span className="visually-hidden">（新しいタブで開きます）</span>
        {/* 矢印は装飾のため読み上げない。外部リンクは右上向きの矢印で区別する */}
        <span className={`${styles.arrow} ${styles.arrowExternal}`} aria-hidden="true">
          ↗
        </span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <span>{children}</span>
      {/* 矢印は装飾のため読み上げない */}
      <span className={styles.arrow} aria-hidden="true">
        →
      </span>
    </Link>
  );
}
