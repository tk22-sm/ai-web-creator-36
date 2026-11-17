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
 * ■ 内容の方針（D-045・D-062・D-063・D-071・D-072）
 * - 公開に合わせて「公開前の草案」の注記は外した（D-071）。法務確認（公開前チェックリスト A1）は未完了のため、
 *   法令上の扱いが未確定の箇所（第3章の国外の事業者・第6章）は「確認中」の書き方のまま残す。制定日は A1 の後に決める。
 * - お問い合わせフォームは準備中。準備中の間の窓口は Instagram の DM。Formspree・Gmail は、フォームでの受け付けを
 *   始めた後に使うサービスとして書く（D-071）。
 * - 個人が運営するポートフォリオとして、必要な説明を残して簡潔にした（D-063）。
 * - 当サイトは Web 制作の学習を目的としたポートフォリオで、Web サイト制作に関するご相談も歓迎する（D-072）。
 * - 運営者は「Kai Design（個人）」とだけ表示する。本名・自宅住所・電話番号・専用メールアドレスは掲載しない（D-040・D-063・D-064）。
 *   個人情報保護法第32条の事項（運営者の氏名・住所等）は、「本人の求めに応じて遅滞なく回答する」方法で、
 *   お問い合わせ窓口へのお申し出に個別に回答する（第8章、D-072）。運営者情報の照会は開示等の請求（第7章）とは区別し、
 *   本人確認を前提にしない。この方針は、法令上の義務の有無やその充足について確認が済んだことを意味しない（A1）。
 * - 内容は、実装（送信する項目・Cookie やアクセス解析を使っていないこと）と、運用ルール
 *   （利用目的の達成後、不要となった情報を適切に削除する。契約・請求の情報は別に管理する。D-071）に合わせる。
 *   固定の削除期限は約束しない。
 * - 未確認の事実は断定しない。外部サービス側の保存期間・バックアップ・ログの削除は保証しない。
 * - フォームの準備中は Instagram の DM が窓口。フォームの受け付け開始後は、フォームが通常の窓口になる（D-064・D-071）。
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
        lead="Kai Design（以下「当サイト」）は、Web制作の学習を目的として個人が運営するポートフォリオサイトです。Webサイト制作に関するご相談も歓迎しています。お問い合わせを通じてお預かりする個人情報を、次のとおり取り扱います。"
      />

      {/* 文書のページのため、各項目は移動させず控えめなフェードだけにする（D-069） */}
      <div className={styles.body}>
        <section className={styles.section} data-reveal="fade" aria-labelledby="privacy-collected">
          <h2 id="privacy-collected" className={styles.heading}>
            1. 取得する情報
          </h2>
          <p>お問い合わせフォームは現在準備中です。フォームでの受け付けを始めた後は、次の情報をお預かりします。</p>
          <ul className={styles.list}>
            <li>お名前（必須）</li>
            <li>メールアドレス（必須）</li>
            <li>ご相談の種類（任意）</li>
            <li>ご相談内容（必須）</li>
          </ul>
          <p>
            「個人情報の取り扱いに同意します」の確認欄は送信前の確認のためのもので、確認欄の状態は送信しません。現在のお問い合わせ窓口である
            Instagram のダイレクトメッセージ（DM）でご連絡いただいた場合は、そのメッセージの内容とアカウント名をお預かりします。
          </p>
          <p>
            サイトの閲覧時やフォームの送信時には、下記の外部サービスが、IPアドレスやブラウザの種類などの通信に関する情報を処理する場合があります。当サイト自体には、Cookie
            を使う仕組みや、アクセス解析・広告のツールは組み込んでいません。
          </p>
        </section>

        <section className={styles.section} data-reveal="fade" aria-labelledby="privacy-purpose">
          <h2 id="privacy-purpose" className={styles.heading}>
            2. 利用目的
          </h2>
          <p>お預かりした情報は、次の目的のためだけに利用します。</p>
          <ul className={styles.list}>
            <li>お問い合わせへの回答と、そのために必要なご連絡</li>
            <li>ご依頼に進んだ場合の、打ち合わせ・契約・請求に関するご連絡</li>
          </ul>
        </section>

        <section className={styles.section} data-reveal="fade" aria-labelledby="privacy-services">
          <h2 id="privacy-services" className={styles.heading}>
            3. 外部サービスの利用
          </h2>
          <dl className={styles.definitionList}>
            <div className={styles.row}>
              <dt className={styles.term}>Formspree</dt>
              <dd>お問い合わせフォームの受け付け・保存・通知（フォームでの受け付けを始めた後に利用します）</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.term}>Gmail</dt>
              <dd>
                フォームの通知メールの受信と、ご返信のやり取り（フォームでの受け付けを始めた後に利用します。Google
                が提供するメールサービスです）
              </dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.term}>Instagram</dt>
              <dd>DM でのご連絡（フォームの準備中は、こちらがお問い合わせ窓口です）</dd>
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

        <section className={styles.section} data-reveal="fade" aria-labelledby="privacy-storage">
          <h2 id="privacy-storage" className={styles.heading}>
            4. 保存期間と削除
          </h2>
          <ul className={styles.list}>
            <li>
              お問い合わせに関する個人情報（Instagram の
              DM、フォームの通知メールやご返信のやり取りのメールを含みます）は、お問い合わせへの対応や必要な連絡のために利用し、利用目的の達成後は、法令上の保存義務や継続的な対応の必要性などを考慮したうえで、不要となった情報を適切に削除します。
            </li>
            <li>
              フォームでの受け付けを始めた後、Formspree に保存された内容は、対応が終わった後、削除できる範囲で速やかに削除します。
            </li>
            <li>
              外部サービス上での保存期間や、各サービスが保持するバックアップ・記録（ログ）は、各サービスの仕様・方針によるもので、当サイトの運営者が直接削除できるものではありません。Instagram
              の DM は、運営者の側で削除しても、送信者の側には残ります。
            </li>
            <li>
              ご依頼をお受けした場合の契約・請求に関する情報は、お問い合わせの情報とは別に管理し、法令上の保存義務がある場合はその期間を含め、必要な期間保管します。
            </li>
          </ul>
        </section>

        <section className={styles.section} data-reveal="fade" aria-labelledby="privacy-security">
          <h2 id="privacy-security" className={styles.heading}>
            5. 安全管理
          </h2>
          <ul className={styles.list}>
            <li>フォームからのお問い合わせの受信には、当サイト専用のメールアカウントを使います。</li>
            <li>お問い合わせを受け付けるメール・フォームのアカウントには、2段階認証を設定しています。</li>
            <li>お預かりした情報は、運営者だけが取り扱います。</li>
            <li>不要となった情報は、第4章のとおり適切に削除します。</li>
          </ul>
        </section>

        <section className={styles.section} data-reveal="fade" aria-labelledby="privacy-third-party">
          <h2 id="privacy-third-party" className={styles.heading}>
            6. 第三者への提供
          </h2>
          <p>法令に基づく場合を除き、ご本人の同意なく第三者に提供することはありません。</p>
          <p>
            上記「3.
            外部サービスの利用」に記載したサービス（国外の事業者を含みます）の利用に関する法令上の取り扱いと、それに伴うご本人への情報提供の方法は、現在確認中です。確認後、このページを更新します。
          </p>
        </section>

        <section className={styles.section} data-reveal="fade" aria-labelledby="privacy-request">
          <h2 id="privacy-request" className={styles.heading}>
            7. 個人情報に関するお問い合わせ
          </h2>
          <p>
            ご自身の情報の開示・訂正・削除のご依頼や、個人情報の取り扱いに関するご質問・苦情は、
            <ExternalLink href={instagram.url}>Instagram（{instagram.handle}）</ExternalLink>
            の DM からご連絡ください。
          </p>
          <p>
            <Link href="/contact" className={styles.link}>
              お問い合わせフォーム
            </Link>
            は現在準備中です。受け付けを始めた後は、フォームからもご連絡いただけます。
          </p>
          <p>DM には、個人情報や機密性の高い内容は記載せず、まずは簡単なご用件のみお送りください。</p>
          <ul className={styles.list}>
            <li>
              ご本人確認のため、ご連絡いただいた方法（お問い合わせの際のメールアドレス、または Instagram のアカウント）宛てに、こちらからご連絡します。
            </li>
            <li>外部サービスが保持している情報のうち、運営者が削除できないものがある場合は、その旨をお伝えします。</li>
          </ul>
        </section>

        <section className={styles.section} data-reveal="fade" aria-labelledby="privacy-operator">
          <h2 id="privacy-operator" className={styles.heading}>
            8. 運営者
          </h2>
          <p>Kai Design（個人）</p>
          <p>
            個人情報保護法に基づき本人の知り得る状態に置くことが必要な運営者の氏名・住所等については、お問い合わせ窓口からお申し出いただいた場合、法令に従い遅滞なく回答します。
          </p>
        </section>

        <section className={styles.section} data-reveal="fade" aria-labelledby="privacy-revision">
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
