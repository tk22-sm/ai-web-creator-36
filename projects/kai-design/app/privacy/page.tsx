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
 * ■ これは草案（D-045・D-062）
 * - 法務確認（公開前チェックリスト A1）が終わるまでは草案として扱い、画面上部にも草案であることを表示する。
 *   確定時に注記を外し、制定日を記載する。
 * - 運営者は「Kai Design（個人）」。氏名・住所・個人のメールアドレスは掲載しない（D-040）。
 * - 内容は、実装（送信する項目・Cookie やアクセス解析を使っていないこと）と、D-062 で決めた運用ルール
 *   （通知・返信メールは最後のやり取りから3か月以内に削除など）に合わせる。
 * - 未確認の事実は断定しない。特に、Formspree 側の保存期間・バックアップ・ログの削除は保証しない。
 *   契約しているプランに依存する説明（無料プランの保存期間など）は、本文には書かない。
 * - SNS の DM は公式アカウントの開設前のため、窓口として書かない。
 * - 国外の事業者への提供（移転）の正式な説明、第三者提供と委託の区別、同意の方法、運営者情報の範囲は
 *   法務確認で決める。現在の同意欄で足りるとは書かない（第5章で「確認中」と明示する）。
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
        lead="Kai Design（以下「当サイト」）は、個人で運営しているWebサイトです。当サイトの運営者は、お問い合わせフォームを通じてお預かりする個人情報を、次のとおり取り扱います。"
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
            「個人情報の取り扱いに同意します」の確認欄は、送信前の確認のためのものです。確認欄の状態は送信しません。
          </p>
          <p>
            このほか、当サイトの閲覧時やフォームの送信時には、次の外部サービスが、IPアドレス・ブラウザの種類・アクセス日時などの通信に関する情報を自動的に処理する場合があります。
          </p>
          <ul className={styles.list}>
            <li>当サイトの閲覧時：サイトの配信に利用している Cloudflare</li>
            <li>
              フォームの送信時：送信の受け付けに利用している Formspree（同社のプライバシーポリシーでは、これらの情報を不正防止やセキュリティの確保などに利用する旨が説明されています）
            </li>
          </ul>
          <p>
            当サイトには、Cookie を使用する仕組みや、アクセス解析・広告配信のツールは組み込んでいません。なお、外部サービスが独自に Cookie などを使用するかどうかは、各サービスの方針によります。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-purpose">
          <h2 id="privacy-purpose" className={styles.heading}>
            2. 利用目的
          </h2>
          <p>
            取得した情報は、お問い合わせへの回答と、それに必要なご連絡のためだけに利用します。それ以外の目的では利用しません。
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
                の管理画面に保存され、通知メールとして当サイト専用のメールアドレスに届きます。詳しくは、
                <ExternalLink href="https://formspree.io/legal/privacy-policy/">
                  Formspree のプライバシーポリシー
                </ExternalLink>
                をご確認ください。
              </dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.term}>Gmail</dt>
              <dd>
                お問い合わせの通知メールの受信と、ご返信のやり取りに利用します（Google が提供するメールサービスです）。詳しくは、
                <ExternalLink href="https://policies.google.com/privacy">
                  Google のプライバシーポリシー
                </ExternalLink>
                をご確認ください。
              </dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.term}>Cloudflare</dt>
              <dd>
                当サイトの配信（Webサイトをインターネット上で表示するための仕組み）に利用します。配信の際に、通信に関する情報が処理されます。詳しくは、
                <ExternalLink href="https://www.cloudflare.com/privacypolicy/">
                  Cloudflare のプライバシーポリシー
                </ExternalLink>
                をご確認ください。
              </dd>
            </div>
          </dl>
          <p>
            これらのサービスの提供者には国外の事業者が含まれ、お預かりした情報が国外で保存・処理される場合があります。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-storage">
          <h2 id="privacy-storage" className={styles.heading}>
            4. 保存期間と削除
          </h2>
          <ul className={styles.list}>
            <li>
              お問い合わせの通知メールと、ご返信のやり取りのメールは、最後のやり取りから3か月以内に削除します。
            </li>
            <li>
              Formspree に保存された送信内容は、お問い合わせへの対応が終わった後、管理画面で削除できる範囲で速やかに削除します。
            </li>
            <li>
              外部サービス上での保存期間や、各サービスが保持するバックアップ・記録（ログ）などは、各サービスの仕様・方針に従って管理されるもので、当サイトの運営者が直接削除できるものではありません。Formspree
              上の情報の保存・削除についても、同社の仕様・方針によります。
            </li>
            <li>
              ご依頼をお受けした場合の契約・請求に関する情報は、お問い合わせの情報とは別に、必要な期間保管します。
            </li>
          </ul>
          <p>
            お預かりした情報は、当サイト専用のアカウントで管理し、2段階認証を設定するなど、漏えいや紛失を防ぐよう努めます。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-third-party">
          <h2 id="privacy-third-party" className={styles.heading}>
            5. 第三者への提供
          </h2>
          <p>法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。</p>
          <p>
            上記「3.
            外部サービスの利用」に記載したサービス（国外の事業者を含みます）の利用が、法令上の「第三者への提供」や「外国にある第三者への提供」に当たるかどうか、また、それに伴うご本人への情報提供や同意の方法については、現在確認中です。確認後、このページを更新します。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-request">
          <h2 id="privacy-request" className={styles.heading}>
            6. 開示・訂正・削除のご依頼
          </h2>
          <p>
            ご自身の情報の開示・訂正・削除をご希望の場合は、
            <Link href="/contact" className={styles.link}>
              お問い合わせフォーム
            </Link>
            からご連絡ください。ご本人確認のため、お問い合わせの際にご入力いただいたメールアドレス宛てにご連絡します。
          </p>
          <p>
            外部サービスが保持している情報のうち、当サイトの運営者が削除できないものがある場合は、その旨をお伝えします。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-contact">
          <h2 id="privacy-contact" className={styles.heading}>
            7. お問い合わせ窓口
          </h2>
          <p>
            このページの内容に関するご質問は、
            <Link href="/contact" className={styles.link}>
              お問い合わせフォーム
            </Link>
            からご連絡ください。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-revision">
          <h2 id="privacy-revision" className={styles.heading}>
            8. 改定
          </h2>
          <p>
            このページの内容は、必要に応じて改定することがあります。改定した場合は、このページでお知らせします。
          </p>
        </section>
      </div>
    </>
  );
}
