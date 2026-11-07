import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { checkFormspreeBuildEnv } from "./lib/formspree";

const nextConfig: NextConfig = {
  output: "export",

  images: {
    unoptimized: true,
  },

  turbopack: {
    root: process.cwd(),
  },
};

/**
 * Next.js の設定。`phase`（実行中の処理の種類）を受け取る関数の形にしている。
 *
 * `next build`（PHASE_PRODUCTION_BUILD）のときだけ、お問い合わせフォームの環境変数を確認し、
 * 本番用の設定なのにフォームIDが無い・形式が不正・接続先の指定が誤っている場合はビルドを失敗させる（D-053）。
 * 開発サーバー（next dev）や他のプロジェクトには影響しない。
 * エラー文には環境変数の値を含めない（ビルドログに値を残さないため）。
 */
export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) {
    const problem = checkFormspreeBuildEnv(
      process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID,
      process.env.NEXT_PUBLIC_FORMSPREE_ENV,
    );
    if (problem) throw new Error(`[Kai Design] お問い合わせフォームの設定エラー：${problem}`);
  }
  return nextConfig;
}
