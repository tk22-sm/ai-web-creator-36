import type { Metadata } from "next";
import ButtonLink from "@/components/ui/ButtonLink";
import PageHeader from "@/components/ui/PageHeader";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "ページが見つかりません",
};

/**
 * 404 ページ（Server Component）。
 *
 * - 存在しない URL や、generateStaticParams に無い slug（例：/projects/unknown）で表示される。
 * - 静的書き出しでは out/404.html として出力され、Cloudflare Pages などの静的ホスティングが
 *   該当ページの無い URL に対してこの HTML を返す。
 * - これまでは Next.js 既定の404画面が body の色を上書きし、本文が白背景になっていた（D-009）。
 *   独自の not-found.tsx を用意し、共通レイアウト（ヘッダー・フッター）とダークテーマの中で表示する（D-029）。
 */
export default function NotFound() {
  return (
    <>
      <PageHeader
        eyebrow="404 Not Found"
        title="ページが見つかりません"
        lead="お探しのページは、移動または削除されたか、URLが間違っている可能性があります。"
      />
      <div className={styles.actions}>
        <ButtonLink href="/">トップページへ戻る</ButtonLink>
        <ButtonLink href="/projects" variant="secondary">
          制作実績を見る
        </ButtonLink>
      </div>
    </>
  );
}
