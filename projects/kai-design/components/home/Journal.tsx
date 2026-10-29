import { articles, noteProfileUrl } from "@/data/articles";
import Section from "@/components/ui/Section";
import styles from "./Journal.module.css";

/** Home に表示する記事の最大件数（仕様書 6章） */
const MAX_ARTICLES = 3;

/**
 * `YYYY-MM-DD` 形式の日付を `YYYY.MM.DD` 形式の表示用文字列に変換する。
 *
 * @param date data/articles.ts に書いた公開日（例：`2026-11-01`）
 * @returns 表示用の文字列（例：`2026.11.01`）
 *
 * Date や toLocaleDateString を使わないのは、実行環境のタイムゾーン・言語設定によって
 * 結果が変わる可能性をなくすため（文字列の置き換えだけで結果が決まる）。
 */
function formatDate(date: string): string {
  return date.replaceAll("-", ".");
}

/**
 * Home の Journal / 学習・制作記録（Server Component）。
 *
 * - ナビの「学習・制作記録」（/#journal）の移動先のため、記事が0件でもセクションは表示する（D-019）。
 * - 記事は note への外部リンク。新しいタブで開くことを読み上げ用テキストで伝える。
 * - 独自ブログ・CMS は作らない（仕様書 4章）。
 *
 * データの流れ：data/articles.ts → 先頭から最大3件 → 記事カード
 */
export default function Journal() {
  const visibleArticles = articles.slice(0, MAX_ARTICLES);

  return (
    <Section
      id="journal"
      eyebrow="Journal"
      title="学習・制作記録"
      lead="Web制作の学習や、作品づくりの過程をnoteで発信しています。"
      action={
        noteProfileUrl && (
          <a
            href={noteProfileUrl}
            className={styles.profileLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            noteで記事を見る
            <span className="visually-hidden">（新しいタブで開きます）</span>
            <span aria-hidden="true">↗</span>
          </a>
        )
      }
    >
      {visibleArticles.length > 0 ? (
        <ul className={styles.list}>
          {visibleArticles.map((article) => (
            <li key={article.url}>
              <a
                href={article.url}
                className={styles.card}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={styles.meta}>
                  <span>{article.category}</span>
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
                </span>
                <span className={styles.title}>{article.title}</span>
                <span className="visually-hidden">（noteの記事・新しいタブで開きます）</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>記事は公開準備中です。公開後、こちらでご紹介します。</p>
      )}
    </Section>
  );
}
