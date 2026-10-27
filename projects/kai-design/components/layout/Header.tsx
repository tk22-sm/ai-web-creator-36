import Link from "next/link";
import { mainNavItems } from "@/data/navigation";
import MobileNav from "./MobileNav";
import NavLinks from "./NavLinks";
import styles from "./Header.module.css";

/**
 * サイト共通ヘッダー（Server Component）。
 *
 * ロゴと PC 用ナビ（768px 以上）を描画し、スマホ用のメニューは MobileNav に任せる。
 * 開閉などの操作が必要な部分だけを Client Component に分けている。
 */
export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* ブランド名「Kai Design」は仮称（仕様書 1章）。ロゴ確定まではテキストで表示 */}
        <Link href="/" className={styles.logo}>
          Kai Design
        </Link>

        <nav className={styles.desktopNav} aria-label="グローバルナビゲーション">
          <NavLinks
            items={mainNavItems}
            listClassName={styles.list}
            linkClassName={styles.link}
          />
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}
