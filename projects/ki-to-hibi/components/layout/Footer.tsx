    import styles from "./Footer.module.css"
    import Link from "next/link"

    export default function Footer() {
        return (
            <footer className={styles.footer}>
                <div className={styles.inner}>
                    <div className={styles.company}>
                        <p className={styles.companyName}>株式会社 木と日々</p>
                        <p className={styles.message}>家を建てる。その先の日々まで。</p>
                    </div>
                    <nav className={styles.nav} aria-label="フッターナビゲーション">
                        <Link href="/works">施工事例</Link>
                        <Link href="/money">お金のこと</Link>
                        <Link href="/land">土地探し</Link>
                        <Link href="/about">私たちについて</Link>
                        <Link href="/contact">無料相談・来場予約</Link>
                    </nav>
                </div>
                <p className={styles.demoNotice}>
                    このサイトはWeb制作学習用の架空企業デモサイトです。
                    会社情報・施工事例はサンプルであり、
                    お問い合わせは実際には送信されません。
                </p>
                <p className={styles.copyright}>
                    © 2026 株式会社 木と日々
                </p>
            </footer>
        )
    }