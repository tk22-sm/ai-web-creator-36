"use client";

import { useEffect, useId, useRef, useState, type FocusEvent } from "react";
import { mainNavItems } from "@/data/navigation";
import NavLinks from "./NavLinks";
import styles from "./MobileNav.module.css";

/**
 * スマートフォン用のナビゲーション（768px 未満で表示）。
 *
 * 「ボタンでナビを開閉するディスクロージャー」として実装している。
 * モーダルダイアログ（フォーカスを閉じ込める方式）にしなかった理由は decision-log.md を参照。
 *
 * 状態：isOpen（メニューが開いているか）だけを持つ。
 * 初期値は必ず false。サーバーで書き出す HTML と、ブラウザでの最初の描画を一致させ、
 * Hydration mismatch を起こさないため。
 *
 * 閉じる操作：
 * - ボタンの再クリック
 * - Esc キー（閉じたあとボタンへフォーカスを戻す）
 * - メニュー内リンクのクリック
 * - フォーカスがメニューの外へ移動したとき（Tab で抜けた場合など）
 * - 画面幅が 768px 以上になったとき（PC用ナビに切り替わるため）
 */
export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // aria-controls 用の ID。useId はサーバーとブラウザで同じ値になる
  const panelId = useId();

  // メニューが開いている間だけ、キーボード・画面幅の監視と背面スクロールの固定を行う。
  // 戻り値のクリーンアップ関数で、閉じたとき（またはアンマウント時）に元へ戻す。
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const handleViewportChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    desktopQuery.addEventListener("change", handleViewportChange);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      desktopQuery.removeEventListener("change", handleViewportChange);
    };
  }, [isOpen]);

  /**
   * ボタンとメニューを包む要素からフォーカスが外れたときに閉じる。
   * relatedTarget は次にフォーカスを受け取る要素。
   * null（パネルの余白クリックなど）の場合は閉じない。
   */
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && !event.currentTarget.contains(next)) {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.root} onBlur={handleBlur}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label="メニュー"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={styles.icon} aria-hidden="true" />
      </button>

      {/*
        パネルは常に DOM に置き、data-open で表示を切り替える（CSS でフェード可能にするため）。
        閉じている間は visibility: hidden により、読み上げ・Tab 移動の対象から外れる。
      */}
      <nav
        id={panelId}
        className={styles.panel}
        data-open={isOpen}
        aria-label="グローバルナビゲーション"
      >
        <NavLinks
          items={mainNavItems}
          listClassName={styles.list}
          linkClassName={styles.link}
          onLinkClick={() => setIsOpen(false)}
        />
      </nav>
    </div>
  );
}
