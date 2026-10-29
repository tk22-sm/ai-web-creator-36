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
export default function ContactCta() {
  return (
    <Section id="contact" eyebrow="Contact" title="お問い合わせ">
      <div className={styles.panel}>
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
