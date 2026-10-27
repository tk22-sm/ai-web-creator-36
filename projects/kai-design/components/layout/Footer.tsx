import Link from "next/link";
import { legalNavItems, mainNavItems } from "@/data/navigation";
import NavLinks from "./NavLinks";
import styles from "./Footer.module.css";

const footerNavItems = [...mainNavItems, ...legalNavItems];

/**
 * サイト共通フッター（Server Component）。
 *
 * 個人によるWeb制作活動であることを明記し、法人と誤認させない（仕様書 1章）。
 * 著作権表示の年は固定値。new Date() を使うとビルド日時に依存し、表示が意図せず変わるため。
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            Kai Design
          </Link>
          <p className={styles.note}>個人で活動するWeb制作のポートフォリオサイトです。</p>
        </div>

        <nav aria-label="フッターナビゲーション">
          <NavLinks
            items={footerNavItems}
            listClassName={styles.list}
            linkClassName={styles.link}
          />
        </nav>

        <p className={styles.copyright}>
          <small>&copy; 2026 Kai Design</small>
        </p>
      </div>
    </footer>
  );
}
