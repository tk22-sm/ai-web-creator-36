/**
 * お問い合わせの送信処理の「型」と、送信先が未設定のときの扱い（STEP 4-B①）。
 *
 * 画面（ContactForm）は「送信関数（ContactSubmitter）を受け取って呼ぶだけ」にし、
 * 実際にどこへ送るかはこのファイル側で決める。こうしておくと、
 * STEP 4-B② で Formspree への送信処理を追加するときに、画面を変更せずに差し替えられる。
 *
 * STEP 4-B① では送信先を用意しない（Formspree への実送信をしない）。
 * getContactSubmitter() は常に null を返し、画面は「準備中」として扱う。
 * 実際には送っていないのに「送信完了」と表示しないため、成功の表示は
 * 送信関数が { ok: true } を返したときだけに限る（D-042）。
 */

/** 送信するデータ（前後の空白を除いた後の値）。同意の有無は送らない */
export type ContactSubmission = {
  name: string;
  email: string;
  category: string;
  message: string;
};

/**
 * 送信に失敗した理由。画面はこの値から日本語のメッセージを選ぶ。
 * - rate-limited：送信回数の上限（HTTP 429 など）
 * - rejected：送信先が内容を受け付けなかった（入力エラー・フォーム無効など）
 * - network：通信できなかった
 * - timeout：一定時間内に応答がなかった
 * - server：送信先のサーバーエラー
 */
export type ContactSubmitFailureReason = "rate-limited" | "rejected" | "network" | "timeout" | "server";

/** 送信結果 */
export type ContactSubmitResult = { ok: true } | { ok: false; reason: ContactSubmitFailureReason };

/** 送信関数。送信先ごとの処理（STEP 4-B② の Formspree など）はこの形で実装する */
export type ContactSubmitter = (data: ContactSubmission) => Promise<ContactSubmitResult>;

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
 * 現在使える送信関数を返す。
 *
 * @returns STEP 4-B① では常に null（送信先が未設定 = 準備中）。
 *   STEP 4-B② で、Formspree のフォームIDが環境変数に設定されている場合だけ
 *   Formspree 用の送信関数を返すように変更する予定。フォームIDはコードに書かない。
 */
export function getContactSubmitter(): ContactSubmitter | null {
  return null;
}
