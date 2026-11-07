/**
 * Formspree へお問い合わせを送る処理（STEP 4-B②）。
 *
 * 公式ドキュメントで確認した仕様（decision-log.md D-047）に合わせて、自前の fetch で送信する。
 * - 送信先：`https://formspree.io/f/<フォームID>`
 * - `Accept: application/json` を付けると、HTML のリダイレクトではなく JSON で結果が返る。
 *   送信回数の上限（1フォームあたり毎分20件）に達すると HTTP 429 が返る。
 * - `email` という名前の欄は、通知メールの返信先（Reply-To）に使われる。
 * - `_gotcha` は隠し入力欄（ハニーポット）。値が入っている送信は、ボットとみなされて Formspree 側で無視される。
 * - `subject` は通知メールの件名に使われる。
 *
 * このファイルは型だけを import する（`import type` は実行時に消える）。
 * そのため Node.js 標準のテスト機能でそのまま検証できる（lib/formspree.test.mjs）。
 *
 * 個人情報を扱うため、送信データ・レスポンスの内容はログに出力しない。
 */
import type { ContactSubmission, ContactSubmitFailureReason, ContactSubmitter } from "./contact-submit";

/** Formspree の送信先（この後ろにフォームIDが付く） */
export const FORMSPREE_ENDPOINT_BASE = "https://formspree.io/f/";

/** 応答を待つ最大時間（ミリ秒）。これを過ぎたら送信を中止して「応答がない」として扱う */
export const FORMSPREE_TIMEOUT_MS = 15_000;

/**
 * 接続先の種類。
 * - test：動作確認用のフォーム（ローカル・プレビュー環境）。画面に「テスト用」と表示する
 * - production：本番用のフォーム
 */
export type FormspreeEnvironment = "test" | "production";

export type FormspreeConfig = {
  formId: string;
  environment: FormspreeEnvironment;
};

/**
 * フォームIDとして受け付ける形式（英数字のみ）。
 * 送信先URLの一部になるため、記号（/ ? # など）を含む値は受け付けず、未設定として扱う。
 */
const FORM_ID_PATTERN = /^[A-Za-z0-9]{4,32}$/;

/**
 * 環境変数の値から、Formspree の設定を作る。
 *
 * @param formId NEXT_PUBLIC_FORMSPREE_FORM_ID の値
 * @param environment NEXT_PUBLIC_FORMSPREE_ENV の値（"production" 以外はすべて test 扱い）
 * @returns 設定。フォームIDが未設定・不正な形式なら null（= 送信しない）
 *
 * 本番扱いは "production" と明示したときだけにする。設定漏れのときに、
 * 本番のつもりがないビルドが本番扱いにならないようにするため（安全側に倒す）。
 */
export function resolveFormspreeConfig(
  formId: string | undefined,
  environment: string | undefined,
): FormspreeConfig | null {
  const id = (formId ?? "").trim();
  if (!FORM_ID_PATTERN.test(id)) return null;
  return {
    formId: id,
    environment: (environment ?? "").trim() === "production" ? "production" : "test",
  };
}

/**
 * Formspree に送るデータを作る。
 *
 * @param data 前後の空白を除いた入力値と、隠し入力欄の値
 * @returns JSON にして送るオブジェクト。同意チェックボックスの値は送らない
 */
export function buildFormspreePayload(data: ContactSubmission): Record<string, string> {
  return {
    name: data.name,
    // `email` は Formspree の特別な欄で、通知メールの返信先（Reply-To）になる
    email: data.email,
    category: data.category,
    message: data.message,
    // `subject` は通知メールの件名になる。値はコードで組み立て、自由入力の文字は入れない
    subject: `Kai Design お問い合わせ（${data.category || "種類未選択"}）`,
    // ハニーポット。人には見えない欄なので、通常は空文字
    _gotcha: data.honeypot,
  };
}

/**
 * HTTP ステータスコードから、失敗の理由を決める。
 *
 * @param status 2xx 以外のステータスコード
 * @returns 429 は送信回数の上限、その他の 4xx は受け付け拒否、5xx などはサーバーエラー
 */
export function classifyFormspreeStatus(status: number): ContactSubmitFailureReason {
  if (status === 429) return "rate-limited";
  if (status >= 400 && status < 500) return "rejected";
  return "server";
}

type FormspreeSubmitterOptions = {
  /** テストで差し替えるための fetch。省略時は送信のたびにグローバルの fetch を使う */
  fetchImpl?: typeof fetch;
  /** タイムアウト（ミリ秒）。省略時は FORMSPREE_TIMEOUT_MS */
  timeoutMs?: number;
};

/**
 * Formspree 用の送信関数を作る。
 *
 * @param formId Formspree のフォームID（公開される識別子。秘密情報ではない）
 * @param options テスト用の差し替え（fetch・タイムアウト）
 * @returns ContactForm に渡す送信関数。結果は { ok: true } か、失敗の理由
 *
 * 処理の流れ：
 * 1. JSON で POST する（Accept: application/json）
 * 2. 2xx なら成功。それ以外はステータスコードで理由を分ける（429 / 4xx / 5xx）
 * 3. 時間内に応答が無ければ中止して timeout、通信自体ができなければ network
 */
export function createFormspreeSubmitter(
  formId: string,
  options: FormspreeSubmitterOptions = {},
): ContactSubmitter {
  const endpoint = `${FORMSPREE_ENDPOINT_BASE}${encodeURIComponent(formId)}`;
  const timeoutMs = options.timeoutMs ?? FORMSPREE_TIMEOUT_MS;

  return async (data) => {
    const fetchImpl = options.fetchImpl ?? globalThis.fetch;
    // AbortController：一定時間で fetch を中止するための仕組み
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildFormspreePayload(data)),
        signal: controller.signal,
      });
      // 成功の判定は HTTP ステータスだけで行う。レスポンス本文（エラー内容など）は読まず、ログにも出さない
      if (response.ok) return { ok: true };
      return { ok: false, reason: classifyFormspreeStatus(response.status) };
    } catch {
      // 中止（タイムアウト）か、それ以外の通信エラーかを区別する
      return { ok: false, reason: controller.signal.aborted ? "timeout" : "network" };
    } finally {
      clearTimeout(timer);
    }
  };
}
