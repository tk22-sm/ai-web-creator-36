import type { Metadata } from "next";
import ContactForm from "@/components/contact/ContactForm";
import PageHeader from "@/components/ui/PageHeader";
import styles from "./page.module.css";

/** title は layout.tsx の template により「お問い合わせ | Kai Design」になる */
export const metadata: Metadata = {
  title: "お問い合わせ",
  description:
    "Kai Designへのお問い合わせページです。Webサイトの新規制作、コーディング、既存サイトの修正・改善などのご相談を受け付けています。",
};

/**
 * お問い合わせページ（/contact、Server Component）。
 *
 * - 見出し・説明文はサーバー側で書き出し、入力と送信を扱う ContactForm だけを Client Component にする。
 * - 導入文は Home の ContactCta と同じ趣旨（個人での活動であること・対応範囲は相談のうえ）にそろえる。
 * - 返信までの日数と個人のメールアドレスは掲載しない（D-040）。問い合わせ窓口はこのフォームだけ。
 * - STEP 4-B① では送信先が未設定のため、フォームは「準備中」として表示される（D-042）。
 */
export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="お問い合わせ"
        lead="Webサイトの新規制作、コーディング、既存サイトの修正・改善などのご相談を受け付けています。個人で活動しているため、対応の範囲や時期はご相談内容を伺ったうえでお伝えします。"
      />
      {/* フォームは入力の妨げにならないよう、移動させずフェードだけにする（D-069） */}
      <div className={styles.body} data-reveal="fade">
        <ContactForm />
      </div>
    </>
  );
}
