import type { CaseStudyBlock } from "@/types/project";
import styles from "./CaseStudyContent.module.css";

type CaseStudyContentProps = {
  block: CaseStudyBlock;
};

/**
 * ケーススタディ1項目分の本文（Server Component）。
 *
 * data/case-studies/*.ts の CaseStudyBlock を受け取り、
 * 段落（paragraphs）→ 箇条書き（list）→ 見出し付きの項目（items）の順に表示する。
 * 値が無い部分は描画しない。見出し（h2）は呼び出し側の Section が持つ。
 *
 * 根拠（basis）はデータ管理用の項目で、画面には表示しない（D-034）。
 * 「設計上の想定」と「実装済みの事実」の区別は、本文の書き方（「想定しました」「実装しています」等）と
 * セクションの分け方（Design は設計の考え方、Development は実装した内容）で伝える。
 */
export default function CaseStudyContent({ block }: CaseStudyContentProps) {
  const { paragraphs, list, listLabel, items } = block;

  return (
    <div className={styles.content}>
      {paragraphs && (
        <div className={styles.paragraphs}>
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      )}

      {list && (
        <div>
          {listLabel && <p className={styles.listLabel}>{listLabel}</p>}
          <ul className={styles.list}>
            {list.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 項目名と説明の組み合わせなので定義リストで書く */}
      {items && (
        <dl className={styles.items}>
          {items.map((item) => (
            <div key={item.title} className={styles.item}>
              <dt className={styles.itemTitle}>{item.title}</dt>
              <dd className={styles.itemBody}>{item.body}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
