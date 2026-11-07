/**
 * お問い合わせの送信処理の「型」と、使う送信先の選択（STEP 4-B① で作成、STEP 4-B② で Formspree に接続）。
 *
 * 画面（ContactForm）は「送信関数（ContactSubmitter）を受け取って呼ぶだけ」にし、
 * 実際にどこへ送るかはこのファイル側で決める（D-042）。
 *
 * 送信先の決め方（D-048）：
 * - 環境変数 NEXT_PUBLIC_FORMSPREE_FORM_ID にフォームIDがあるときだけ、Formspree へ送る。
 *   未設定・不正な形式なら送信関数は null（= 準備中。通信しない）。
 * - NEXT_PUBLIC_FORMSPREE_ENV が "production" のときだけ本番扱い。それ以外は test 扱いで、
 *   画面に「テスト用の送信先」と表示する。
 * - NEXT_PUBLIC_ で始まる環境変数は、ビルド時に JavaScript へ書き込まれ、誰でも見られる。
 *   フォームIDは公開される識別子なので問題ないが、APIキーなどの秘密情報は絶対に入れない。
 *
 * 実際には送っていないのに「送信完了」と表示しないため、成功の表示は
 * 送信関数が { ok: true } を返したときだけに限る。
 */
import { createFormspreeSubmitter, resolveFormspreeConfig, type FormspreeEnvironment } from "./formspree";

/** 送信するデータ（前後の空白を除いた後の値）。同意の有無は送らない */
export type ContactSubmission = {
  name: string;
  email: string;
  category: string;
  message: string;
  /** 隠し入力欄（ハニーポット）の値。人が操作した場合は空文字になる */
  honeypot: string;
};

/**
 * 送信に失敗した理由。画面はこの値から日本語のメッセージを選ぶ。
 * - rate-limited：送信回数の上限（HTTP 429）
 * - rejected：送信先が内容を受け付けなかった（入力エラー・フォームが見つからない等の 4xx）
 * - network：通信できなかった
 * - timeout：一定時間内に応答がなかった
 * - server：送信先のサーバーエラー（5xx）
 */
export type ContactSubmitFailureReason = "rate-limited" | "rejected" | "network" | "timeout" | "server";

/** 送信結果 */
export type ContactSubmitResult = { ok: true } | { ok: false; reason: ContactSubmitFailureReason };

/** 送信関数。送信先ごとの処理（lib/formspree.ts など）はこの形で実装する */
export type ContactSubmitter = (data: ContactSubmission) => Promise<ContactSubmitResult>;

/** 画面の表示を切り替えるための接続状態 */
export type ContactFormMode = "unconfigured" | FormspreeEnvironment;

/** 失敗理由ごとの日本語メッセージ。どの場合も入力内容は画面に残る */
export const CONTACT_FAILURE_MESSAGES: Record<ContactSubmitFailureReason, string> = {
  "rate-limited":
    "送信が集中しているため、受け付けられませんでした。しばらく時間をおいてから、もう一度お試しください。",
  rejected: "送信内容を受け付けられませんでした。入力内容をご確認のうえ、もう一度お試しください。",
  network: "通信できませんでした。インターネット接続をご確認のうえ、もう一度お試しください。",
  timeout: "応答がありませんでした。時間をおいて、もう一度お試しください。",
  server: "送信できませんでした。時間をおいて、もう一度お試しください。",
};

/**
 * 環境変数から Formspree の設定を読む。
 *
 * `process.env.NEXT_PUBLIC_〜` は必ずこの書き方（ドットでつなぐ）で参照する。
 * Next.js はビルド時にこの書き方の箇所だけを実際の値に置き換えるため、
 * 変数に入れてから参照すると置き換わらない（Next.js 同梱ドキュメントの環境変数ガイドより）。
 */
function readFormspreeConfig() {
  return resolveFormspreeConfig(
    process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID,
    process.env.NEXT_PUBLIC_FORMSPREE_ENV,
  );
}

/**
 * 現在の接続状態を返す。
 *
 * @returns "unconfigured"（未設定）・"test"・"production"
 */
export function getContactFormMode(): ContactFormMode {
  return readFormspreeConfig()?.environment ?? "unconfigured";
}

/**
 * 現在使える送信関数を返す。
 *
 * @returns フォームIDが設定されていれば Formspree 用の送信関数、未設定なら null（送信しない）
 */
export function getContactSubmitter(): ContactSubmitter | null {
  const config = readFormspreeConfig();
  return config ? createFormspreeSubmitter(config.formId) : null;
}
