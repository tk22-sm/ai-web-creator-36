import Link from "next/link";
import styles from "./Breadcrumb.module.css";

export type BreadcrumbItem = {
  /** 表示名 */
  label: string;
  /** リンク先。最後の項目（現在のページ）では省略する */
  href?: string;
};

type BreadcrumbProps = {
  items: readonly BreadcrumbItem[];
};

/**
 * パンくずリスト（Server Component）。
 *
 * 例：items = [{ label: "制作実績", href: "/projects" }, { label: "MELLOW COFFEE" }]
 *   → 「制作実績 › MELLOW COFFEE」
 *
 * - <nav aria-label> で「パンくずリスト」というナビゲーションであることを支援技術に伝える。
 * - 順序に意味があるため <ol> で書く。
 * - 現在のページはリンクにせず aria-current="page" を付ける。
 * - 区切り記号（›）は CSS の疑似要素で描き、読み上げられないようにする。
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="パンくずリスト" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item.label} className={styles.item}>
            {item.href ? (
              <Link href={item.href} className={styles.link}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
