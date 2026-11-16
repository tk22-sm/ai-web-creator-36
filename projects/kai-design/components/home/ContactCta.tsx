import ButtonLink from "@/components/ui/ButtonLink";
import Section from "@/components/ui/Section";
import styles from "./ContactCta.module.css";

/**
 * Home の Contact（Server Component）。
 *
 * 問い合わせフォーム本体（contact/ContactForm.tsx）は STEP 4 で /contact に作る。
 * ここはフォームへ誘導する CTA だけを置くため、名前を ContactCta として区別している（D-016）。
 *
 * 個人での活動であることを明記し、返信期限など未確定の約束は書かない。
 */
type ContactCtaProps = {
  /**
   * トップページの締めくくりとして強調するか（D-065）。
   * true のとき、セクションを面の色で区切って余白を広げ、パネルを背景色にして浮き立たせる。
   * 制作実績・About ページでは指定せず、従来の見た目のまま使う。
   */
  closing?: boolean;
};

export default function ContactCta({ closing = false }: ContactCtaProps) {
  return (
    <Section
      id="contact"
      spacing={closing ? "feature" : "default"}
      tone={closing ? "surface" : "default"}
      eyebrow="Contact"
      title="お問い合わせ"
    >
      <div
        className={closing ? `${styles.panel} ${styles.closing}` : styles.panel}
        data-reveal
        data-reveal-delay="1"
      >
        <p className={styles.text}>
          Webサイトの新規制作、コーディング、既存サイトの修正・改善などのご相談を受け付けています。個人で活動しているため、対応の範囲や時期はご相談内容を伺ったうえでお伝えします。
        </p>
        <div className={styles.action}>
          <ButtonLink href="/contact">お問い合わせフォームへ</ButtonLink>
        </div>
      </div>
    </Section>
  );
}
