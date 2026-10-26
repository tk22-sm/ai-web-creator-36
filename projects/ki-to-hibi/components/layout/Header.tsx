"use client";

import { useState } from "react"
import Link from "next/link"
import styles from "./Header.module.css"

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                株式会社 木と日々
                </Link>
                <nav
                    className={styles.nav}
                    aria-label="グローバルナビゲーション"
                >
                    <Link href="/works">
                        施工事例
                    </Link>
                    <Link href="/money">
                        お金のこと
                    </Link>
                    <Link href="/land">
                        土地探し
                    </Link>
                    <Link href="/about">
                        私たちについて
                    </Link>
                    <Link href="/contact" className={styles.contactLink}>
                        無料相談・来場予約
                    </Link>
                </nav>

                <button 
                    type="button" 
                    className={`${styles.menuButton} ${isOpen ? styles.open : ""}`}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-label="メニューを開閉する"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            {isOpen && (
                <nav
                    className={styles.mobileNav}
                    aria-label="モバイルナビゲーション"
                >
                    <Link 
                        href="/works"
                        onClick={() => setIsOpen(false)}
                    >
                        施工事例
                    </Link>
                    <Link 
                        href="/money"
                        onClick={() => setIsOpen(false)}
                    >
                        お金のこと
                    </Link>
                    <Link 
                        href="/land"
                        onClick={() => setIsOpen(false)}
                    >
                        土地探し
                    </Link>
                    <Link 
                        href="/about"
                        onClick={() => setIsOpen(false)}
                    >
                        私たちについて
                    </Link>
                    <Link 
                        href="/contact"
                        onClick={() => setIsOpen(false)}
                        className={styles.contactLink}
                    >
                        無料相談・来場予約
                    </Link>
                </nav>
            )}

        </header>
    )
}