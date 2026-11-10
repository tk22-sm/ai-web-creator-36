import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { instagram } from "@/data/contact-channels";
import styles from "./page.module.css";

/** title は layout.tsx の template により「個人情報の取り扱い | Kai Design」になる */
export const metadata: Metadata = {
  title: "個人情報の取り扱い",
  description: "Kai Designのお問い合わせで取得する個人情報の取り扱いについて説明します。",
};

/**
 * 個人情報の取り扱い（/privacy、Server Component）。
 *
 * ■ これは草案（D-045・D-062・D-063）
 * - 法務確認（公開前チェックリスト A1）が終わるまでは草案として扱い、画面上部にも草案であることを表示する。
 *   確定時に注記を外し、制定日を記載する。
 * - 個人が運営するポートフォリオとして、必要な説明を残して簡潔にした（D-063）。
 * - 運営者は「Kai Design（個人）」とだけ表示する。本名・自宅住所・専用メールアドレスは掲載しない（D-040・D-063・D-064）。
 *   この表示方針は、法令上の確認が済んだことを意味しない。
 * - 内容は、実装（送信する項目・Cookie やアクセス解析を使っていないこと）と、運用ルール
 *   （通知・返信メールと DM は最後のやり取りから3か月以内に削除など）に合わせる。
 * - 未確認の事実は断定しない。外部サービス側の保存期間・バックアップ・ログの削除は保証しない。
 * - 通常の窓口はお問い合わせフォーム。Instagram の DM はフォームが使えない場合の窓口（D-064）。
 *   DM の受信テストは未実施のため、確認済みとは書かない。
 * - 法的に未確定の事項（国外の事業者への提供の扱い、安全管理措置として示す範囲など）は
 *   公開前チェックリスト A1 で管理する。未確定の内容を確定した説明として書かない。
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
        lead="Kai Design（以下「当サイト」）は、個人が運営するWeb制作のポートフォリオサイトです。お問い合わせを通じてお預かりする個人情報を、次のとおり取り扱います。"
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
          <p>お問い合わせフォームで、次の情報をお預かりします。</p>
          <ul className={styles.list}>
            <li>お名前（必須）</li>
            <li>メールアドレス（必須）</li>
            <li>ご相談の種類（任意）</li>
            <li>ご相談内容（必須）</li>
          </ul>
          <p>
            「個人情報の取り扱いに同意します」の確認欄は送信前の確認のためのもので、確認欄の状態は送信しません。Instagram
            のダイレクトメッセージ（DM）でご連絡いただいた場合は、そのメッセージの内容とアカウント名をお預かりします。
          </p>
          <p>
            サイトの閲覧時やフォームの送信時には、下記の外部サービスが、IPアドレスやブラウザの種類などの通信に関する情報を処理する場合があります。当サイト自体には、Cookie
            を使う仕組みや、アクセス解析・広告のツールは組み込んでいません。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-purpose">
          <h2 id="privacy-purpose" className={styles.heading}>
            2. 利用目的
          </h2>
          <p>お預かりした情報は、次の目的のためだけに利用します。</p>
          <ul className={styles.list}>
            <li>お問い合わせへの回答と、そのために必要なご連絡</li>
            <li>ご依頼に進んだ場合の、打ち合わせ・契約・請求に関するご連絡</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="privacy-services">
          <h2 id="privacy-services" className={styles.heading}>
            3. 外部サービスの利用
          </h2>
          <dl className={styles.definitionList}>
            <div className={styles.row}>
              <dt className={styles.term}>Formspree</dt>
              <dd>お問い合わせ内容の受け付け・保存・通知</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.term}>Gmail</dt>
              <dd>通知メールの受信と、ご返信のやり取り（Google が提供するメールサービスです）</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.term}>Instagram</dt>
              <dd>お問い合わせフォームをご利用いただけない場合の、DM でのご連絡</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.term}>Cloudflare</dt>
              <dd>サイトの配信</dd>
            </div>
          </dl>
          <p>
            これらのサービスの提供者には国外の事業者が含まれ、お預かりした情報が国外で保存・処理される場合があります。各サービスでの取り扱いは、
            <ExternalLink href="https://formspree.io/legal/privacy-policy/">Formspree</ExternalLink>・
            <ExternalLink href="https://policies.google.com/privacy">Google</ExternalLink>・
            <ExternalLink href="https://www.cloudflare.com/privacypolicy/">Cloudflare</ExternalLink>
            のプライバシーポリシーと、Instagram のプライバシーポリシーをご確認ください。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-storage">
          <h2 id="privacy-storage" className={styles.heading}>
            4. 保存期間と削除
          </h2>
          <ul className={styles.list}>
            <li>
              お問い合わせの通知メール、ご返信のやり取りのメール、Instagram の DM は、最後のやり取りから3か月以内に削除します。
            </li>
            <li>Formspree に保存された内容は、対応が終わった後、削除できる範囲で速やかに削除します。</li>
            <li>
              外部サービス上での保存期間や、各サービスが保持するバックアップ・記録（ログ）は、各サービスの仕様・方針によるもので、当サイトの運営者が直接削除できるものではありません。Instagram
              の DM は、運営者の側で削除しても、送信者の側には残ります。
            </li>
            <li>ご依頼をお受けした場合の契約・請求に関する情報は、お問い合わせの情報とは別に、必要な期間保管します。</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="privacy-security">
          <h2 id="privacy-security" className={styles.heading}>
            5. 安全管理
          </h2>
          <ul className={styles.list}>
            <li>お問い合わせの受信には、当サイト専用のメールアカウントを使います。</li>
            <li>お問い合わせを受け付けるメール・フォームのアカウントには、2段階認証を設定しています。</li>
            <li>お預かりした情報は、運営者だけが取り扱います。</li>
            <li>不要になった情報は、上記の期間内に削除します。</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="privacy-third-party">
          <h2 id="privacy-third-party" className={styles.heading}>
            6. 第三者への提供
          </h2>
          <p>法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。</p>
          <p>
            上記「3.
            外部サービスの利用」に記載したサービス（国外の事業者を含みます）の利用に関する法令上の取り扱いと、それに伴うご本人への情報提供の方法は、現在確認中です。確認後、このページを更新します。
          </p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-request">
          <h2 id="privacy-request" className={styles.heading}>
            7. 個人情報に関するお問い合わせ
          </h2>
          <p>
            ご自身の情報の開示・訂正・削除のご依頼や、個人情報の取り扱いに関するご質問は、当サイトの
            <Link href="/contact" className={styles.link}>
              お問い合わせフォーム
            </Link>
            からご連絡ください。
          </p>
          <p>
            お問い合わせフォームをご利用いただけない場合は、
            <ExternalLink href={instagram.url}>Instagram（{instagram.handle}）</ExternalLink>
            の DM からご連絡ください。
          </p>
          <p>DM には、個人情報や機密性の高い内容は記載せず、まずは簡単なご用件のみお送りください。</p>
          <ul className={styles.list}>
            <li>
              ご本人確認のため、ご連絡いただいた方法（お問い合わせの際のメールアドレス、または Instagram のアカウント）宛てに、こちらからご連絡します。
            </li>
            <li>外部サービスが保持している情報のうち、運営者が削除できないものがある場合は、その旨をお伝えします。</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="privacy-operator">
          <h2 id="privacy-operator" className={styles.heading}>
            8. 運営者
          </h2>
          <p>Kai Design（個人）</p>
        </section>

        <section className={styles.section} aria-labelledby="privacy-revision">
          <h2 id="privacy-revision" className={styles.heading}>
            9. 改定
          </h2>
          <p>
            このページの内容は、必要に応じて改定することがあります。改定した場合は、このページでお知らせします。
          </p>
        </section>
      </div>
    </>
  );
}
