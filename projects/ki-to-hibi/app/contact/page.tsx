"use client";

import { useState } from "react";
import styles from "./page.module.css"
import Link from "next/link";

export default function ContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        // console.log("フォームが送信されました");
        setIsConfirming(true);
    }
    function handleComplete() {
        setIsCompleted(true);
    }

    return (
        <main className={styles.main}>
            <h1>無料相談・来場予約</h1>
            <p>家づくりに関するご相談を、お気軽にお寄せください。</p>
            {!isCompleted && !isConfirming && (
                <aside className={styles.demoNotice} aria-label="デモフォームの注意事項">
                    <p className={styles.demoNoticeTitle}>
                        このお問い合わせフォームはデモです
                    </p>
                    <p>
                        このサイトはWeb制作学習用のサンプルです。
                        入力内容は送信・保存されません。
                        実際の個人情報は入力しないでください。
                    </p>
                </aside>
            )}
            {isCompleted ? (
                <section className={styles.completed}>
                    <h2>送信完了（デモ）</h2>
                    <p>
                        フォームの操作が完了しました。
                        実際の問い合わせは送信されていません。
                    </p>
                    <Link href="/" className={styles.homeLink}>
                        トップページに戻る →
                    </Link>
                </section>
            ) : isConfirming ? (
                <section className={styles.confirmation}>
                    <h2>入力内容の確認</h2>
                    <p>以下の内容でお間違いないかご確認ください。</p>
                    <div className={styles.confirmationList}>
                        <div className={styles.confirmationItem}>
                            <h3>お名前</h3>
                            <p>{name}</p>
                        </div>
                        <div className={styles.confirmationItem}>
                            <h3>メールアドレス</h3>
                            <p>{email}</p>
                        </div>
                        <div className={styles.confirmationItem}>
                            <h3>ご相談内容</h3>
                            <p>{message}</p>
                        </div>
                    </div>
                    <div className={styles.confirmationActions}>
                        <button
                            type="button"
                            onClick={() => setIsConfirming(false)}
                            className={styles.backButton}
                        >
                            入力画面に戻る
                        </button>

                        <button
                            type="button"
                            onClick={handleComplete}
                            className={styles.submitButton}
                        >
                            送信デモを完了する
                        </button>
                    </div>
                </section>
            ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="name">お名前</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="例：山田 太郎"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="email">メールアドレス</label>
                    <input 
                        id="email"
                        name="email"
                        type="email"
                        placeholder="example@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                     />
                </div>
                <div className={styles.field}>
                    <label htmlFor="message">ご相談内容</label>
                    <textarea 
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="ご相談内容をご入力ください。"
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
                <button type="submit" className={styles.submitButton}>
                    入力内容を確認する
                </button>
            </form>
            )}
        </main>
    )
}