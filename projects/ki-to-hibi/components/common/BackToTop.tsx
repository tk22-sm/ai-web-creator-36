"use client";

import styles from "./BackToTop.module.css";

export default function BackToTop() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={scrollToTop}
      aria-label="ページの先頭へ戻る"
    >
      ↑
    </button>
  );
}