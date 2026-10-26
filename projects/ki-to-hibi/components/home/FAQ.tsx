"use client";

import styles from "./FAQ.module.css";
import { useState } from "react";

const faqs = [
    {
        id: 1,
        question: "相談だけでも大丈夫ですか？",
        answer: "もちろんです。家づくりを考え始めたばかりの方も、お気軽にご相談ください。",
    },
    {
        id: 2,
        question: "土地が決まっていなくても相談できますか？",
        answer: "はい。土地探しから資金計画まで、一緒に考えていきます。",
    },
    {
        id: 3,
        question: "予算が決まっていなくても大丈夫ですか？",
        answer: "はい。ご家族の暮らしに合った無理のない予算から整理していきます。",
    },
];

export default function FAQ() {
    const [openId, setOpenId] = useState<number | null>(null)

    return (
        <section className={styles.faq}>
            <span className={styles.label}>FAQ</span>
            <h2 className={styles.title}>よくある質問</h2>
            <div className={styles.list}>
                {faqs.map((faq) => (
                    <div key={faq.id} className={styles.item}>
                        <button 
                            type="button" 
                            className={styles.question}
                            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                            aria-expanded={openId === faq.id}
                            aria-controls={`faq-answer-${faq.id}`}
                        >
                                {faq.question}
                                <span className={styles.icon}>
                                    {openId === faq.id ? "−" : "＋"}
                                </span>
                        </button>
                        <div
                            id={`faq-answer-${faq.id}`}
                            className={`${styles.answerWrapper} ${
                                openId === faq.id ? styles.open : ""
                            }`}
                            aria-hidden={openId !== faq.id}
                            >
                            <div className={styles.answerInner}>
                                <p className={styles.answer}>{faq.answer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}