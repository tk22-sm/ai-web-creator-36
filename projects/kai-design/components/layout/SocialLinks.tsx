import Image from "next/image";
import { socialLinks, type SocialLink } from "@/data/social-links";
import styles from "./SocialLinks.module.css";

type SocialLinksProps = {
  /** 置く場所。見た目（大きさ・揃え）だけが変わる */
  placement: "header" | "menu" | "footer";
};

/**
 * Instagram の glyph。Meta の Brand Resource Center から本人がダウンロードした公式ファイル
 * （public/images/Instagram_Glyph_White.svg、白）を、改変せずにそのまま表示する（D-076）。
 *
 * - <img>（next/image）で読み込む。SVG の中に <style> があるため、HTML に直接書き込むと CSP（style-src）で
 *   ブロックされる。画像として読み込めば、ファイルを改変せずに使え、CSP（img-src 'self'）の範囲で表示できる。
 * - 色は公式ファイルの白のまま（色を変える許可を一次情報で確認できていないため変えない）。
 * - 装飾なので alt=""。リンクの読み上げ名は visually-hidden の「Instagram（新しいタブで開きます）」で伝える。
 */
const INSTAGRAM_GLYPH = { src: "/images/Instagram_Glyph_White.svg", size: 20 } as const;

function Mark({ id }: { id: SocialLink["id"] }) {
  if (id === "instagram") {
    return (
      <Image
        src={INSTAGRAM_GLYPH.src}
        alt=""
        width={INSTAGRAM_GLYPH.size}
        height={INSTAGRAM_GLYPH.size}
        className={styles.glyph}
      />
    );
  }
  // note は公式ロゴの利用条件を確認できていないため、ロゴではなく文字で表示する（D-074）
  return (
    <span className={styles.wordmark} aria-hidden="true">
      note
    </span>
  );
}

/**
 * SNS へのリンク（Instagram → note）。ヘッダー（768px 以上）・スマホメニュー・フッターで使う（D-074）。
 *
 * - 外部リンクは新しいタブで開き、rel="noopener noreferrer" で開いた先からこのページを操作させない。
 * - 見た目はアイコン・文字だけだが、読み上げ名は「Instagram（新しいタブで開きます）」のように、
 *   サービス名と新しいタブで開くことを伝える（サイト内の他の外部リンクと同じ言い方）。
 * - 押せる範囲は 44×44px 以上。
 * - Server Component（状態なし）。スマホメニュー（Client Component）の中でもそのまま使える。
 */
export default function SocialLinks({ placement }: SocialLinksProps) {
  return (
    <ul className={`${styles.list} ${styles[placement]}`} aria-label="SNS">
      {socialLinks.map((link) => (
        <li key={link.id}>
          <a
            href={link.url}
            className={styles.link}
            data-service={link.id}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mark id={link.id} />
            <span className="visually-hidden">{link.label}（新しいタブで開きます）</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
