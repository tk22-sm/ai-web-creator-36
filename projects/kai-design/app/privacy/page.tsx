import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import PageHeader from "@/components/ui/PageHeader";
import styles from "./page.module.css";

/** title は layout.tsx の template により「個人情報の取り扱い | Kai Design」になる */
export const metadata: Metadata = {
  title: "個人情報の取り扱い",
  description: "Kai Designのお問い合わせフォームで取得する個人情報の取り扱いについて説明します。",
};

/**
 * 個人情報の取り扱い（/privacy、Server Component）。
 *
 * ■ これは草案（STEP 4-B①。D-045）
 * - 法的な最終確認と、Formspree・Cloudflare の実際の設定確認が終わるまでは草案として扱い、
 *   画面上部にも草案であることを表示する。確定時に注記を外し、制定日を記載する。
 * - 運営者は「Kai Design（個人）」。氏名・住所・個人のメールアドレスは掲載しない（D-040）。
 * - 未確認の事実（Formspree の保存期間・保存場所、Cloudflare の Cookie・アクセス解析など）は断定しない。
 *   外部サービスの詳細は、各サービスのプライバシーポリシーへの案内にとどめる。
 * - STEP 4-B② で、通知メールと Formspree が自動取得する通信情報について、確認できた範囲で補足した（D-054）。
 *   通信情報の記述は「Formspree のプライバシーポリシーにそう説明されている」という書き方にとどめる。
 *
 * フッターのリンク名（data/navigation.ts の「個人情報の取り扱い」）と見出しを一致させている。
 */

/** 外部サイトへのリンク。新しいタブで開くことを読み上げ用テキストでも伝える（ButtonLink の external と同じ方針） */
function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
      {children}
      <span className="visually-hidden">（新しいタブで開きます）</span>
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="個人情報の取り扱い"
        lead="Kai Design（個人。以下「当サイト」）は、お問い合わせフォームを通じてお預かりする個人情報を、次のとおり取り扱います。"
      >
        <p className={styles.draftNotice}>
          このページは公開前の草案です。内容は確認中のため、今後変更する場合があります。
        </p>
      </PageHeader>

      <div className={styles.body}>
        <section className={styles.section} aria-labelledby="privacy-collected">
          <h2 id="privacy-collected" className={styles.heading}>
            1. 取得する情報
          </h2>
          <p>お問い合わせフォームに入力された、次の情報を取得します。</p>
          <ul className={styles.list}>
            <li>お名前</li>
            <li>メールアドレス</li>
            <li>ご相談の種類（任意）</li>
            <li>ご相談内容</li>
          </ul>
          <p>
            フォームの送信時には、送信の受け付けに利用する外部サービス（Formspree）が、通信に関する情報を自動的に取得する場合があります。Formspree
            のプライバシーポリシーでは、IPアドレス、ブラウザの種類、アクセス日時などを自動的に取得し、不正防止やセキュリティの確保などに利用する旨が説明されています。詳しくは、同社のプライバシーポリシーをご確認ください。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-purpose">
          <h2 id="privacy-purpose" className={styles.heading}>
            2. 利用目的
          </h2>
          <p>
            取得した情報は、お問い合わせへの回答と、それに必要なご連絡のためにだけ利用します。それ以外の目的では利用しません。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-services">
          <h2 id="privacy-services" className={styles.heading}>
            3. 外部サービスの利用
          </h2>
          <p>当サイトでは、次の外部サービスを利用します。</p>
          <dl className={styles.definitionList}>
            <div className={styles.row}>
              <dt className={styles.term}>Formspree</dt>
              <dd>
                お問い合わせフォームの送信内容の受け付け・保存・通知に利用します。送信された内容は Formspree
                の管理画面に保存されるほか、通知メールとして当サイトの運営者のメールアドレスに届きます。Formspree における情報の取り扱いは、
                <ExternalLink href="https://formspree.io/legal/privacy-policy/">
                  Formspree のプライバシーポリシー
                </ExternalLink>
                をご確認ください。
              </dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.term}>Cloudflare</dt>
              <dd>当サイトの配信（Webサイトをインターネット上で表示するための仕組み）に利用します。</dd>
            </div>
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="privacy-storage">
          <h2 id="privacy-storage" className={styles.heading}>
            4. 保存・管理
          </h2>
          <p>
            お預かりした情報は、お問い合わせへの対応に必要な期間保管し、不要になった後は削除するよう努めます。運営者のメールアドレスに届いた通知メールについても同様です。外部サービス上での保存期間は、各サービスの利用条件によります。
          </p>
          <p>情報の漏えいや紛失を防ぐため、適切な管理に努めます。</p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-third-party">
          <h2 id="privacy-third-party" className={styles.heading}>
            5. 第三者への提供
          </h2>
          <p>
            法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。なお、上記「3.
            外部サービスの利用」に記載したサービスは、お問い合わせの受け付けのために利用するものです。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-contact">
          <h2 id="privacy-contact" className={styles.heading}>
            6. お問い合わせ窓口
          </h2>
          <p>
            ご自身の情報の確認・訂正・削除のご希望や、このページの内容に関するご質問は、
            <Link href="/contact" className={styles.link}>
              お問い合わせフォーム
            </Link>
            からご連絡ください。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-revision">
          <h2 id="privacy-revision" className={styles.heading}>
            7. 改定
          </h2>
          <p>
            このページの内容は、必要に応じて改定することがあります。改定した場合は、このページでお知らせします。
          </p>
        </section>
      </div>
    </>
  );
}
