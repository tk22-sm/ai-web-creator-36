"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/data/navigation";

type NavLinksProps = {
  items: readonly NavItem[];
  /** <ul> に付けるクラス。見た目は呼び出し側の CSS Module が決める */
  listClassName?: string;
  /** 各 <a> に付けるクラス */
  linkClassName?: string;
  /** リンクがクリックされたときの処理（スマホメニューを閉じるために使う） */
  onLinkClick?: () => void;
};

/**
 * 現在のパスが、そのリンクのページ（または配下のページ）かを判定する。
 *
 * @param pathname usePathname() が返す現在のパス（例：`/projects/ki-to-hibi`）
 * @param href ナビ項目のリンク先
 * @returns 現在ページなら true
 *
 * - アンカー付きリンク（`/#journal`）はページ内の位置を指すため、常に false。
 * - `/projects/[slug]` のような配下ページでも「制作実績」を現在地として扱う。
 */
function isCurrentPage(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * ナビゲーションのリンク一覧（<ul>）を描画する。
 *
 * Client Component にしている理由：現在地の判定に usePathname（ブラウザ側のフック）が必要なため。
 * Header / Footer 本体は Server Component のまま保ち、ブラウザに送る JavaScript をこの部分だけに抑える。
 *
 * データの流れ：data/navigation.ts の配列 → 呼び出し元（Header / MobileNav / Footer）→ items props → <Link>
 */
export default function NavLinks({
  items,
  listClassName,
  linkClassName,
  onLinkClick,
}: NavLinksProps) {
  const pathname = usePathname();

  return (
    <ul className={listClassName}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={linkClassName}
            // 支援技術に「現在のページ」であることを伝える。見た目も CSS でこの属性を参照する
            aria-current={isCurrentPage(pathname, item.href) ? "page" : undefined}
            onClick={onLinkClick}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
