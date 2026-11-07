/**
 * 送信に失敗したあと、再送を受け付けるまでの待ち時間を決める（D-057）。
 *
 * 画面（ContactForm）から切り離した純粋な関数だけを置く（型だけを import する）。
 * Retry-After ヘッダーの読み取り（parseRetryAfterMs）は送信処理側の lib/formspree.ts にある。
 * そのため Node.js 標準のテスト機能で検証できる（lib/contact-cooldown.test.mjs）。
 *
 * 待ち時間を設ける失敗：
 * - rate-limited（HTTP 429）：送信回数の上限。すぐに再送しても受け付けられないため。
 *   Formspree の上限は「1フォームあたり毎分20件」なので、既定は60秒。
 *   Retry-After ヘッダーの値が取れた場合は考慮するが、下限30秒・上限10分に収める。
 * - timeout・network：届いているか分からないため、重複送信を避ける（30秒。D-052）。
 * それ以外（成功・受付拒否・フォームが見つからない・サーバーエラー）は待ち時間なし。
 *
 * これは画面上の制限であり、ページの再読み込みで解除される。悪意のある送信を止める仕組みではない
 * （送信回数の制限そのものは Formspree 側で行われる）。
 */
import type { ContactSubmitResult } from "./contact-submit";

/** 届いたか分からない失敗（timeout・network）のあとの待ち時間 */
export const UNCERTAIN_COOLDOWN_MS = 30_000;

/** 送信回数の上限（429）のあとの既定の待ち時間（Retry-After が無い・読めない・不正な場合） */
export const RATE_LIMIT_DEFAULT_COOLDOWN_MS = 60_000;

/** Retry-After を考慮するときの下限と上限（極端な値を信用しない） */
export const RATE_LIMIT_MIN_COOLDOWN_MS = 30_000;
export const RATE_LIMIT_MAX_COOLDOWN_MS = 600_000;

/**
 * 送信結果から、次に送信を受け付けるまでの待ち時間を決める。
 *
 * @param result 送信関数の結果
 * @returns 待ち時間（ミリ秒）。待ち時間が無ければ 0
 */
export function getResubmitCooldownMs(result: ContactSubmitResult): number {
  if (result.ok) return 0;
  switch (result.reason) {
    case "rate-limited": {
      const requested = result.retryAfterMs ?? RATE_LIMIT_DEFAULT_COOLDOWN_MS;
      return Math.min(Math.max(requested, RATE_LIMIT_MIN_COOLDOWN_MS), RATE_LIMIT_MAX_COOLDOWN_MS);
    }
    case "timeout":
    case "network":
      return UNCERTAIN_COOLDOWN_MS;
    default:
      return 0;
  }
}

/**
 * 再送を受け付ける時刻を更新する。すでに後の時刻が設定されていれば、短くはしない。
 *
 * @param currentAllowedAt 現在の「再送を受け付ける時刻」（ミリ秒。制限なしは 0）
 * @param now 現在時刻（ミリ秒）
 * @param cooldownMs 今回の失敗による待ち時間
 * @returns 新しい「再送を受け付ける時刻」
 */
export function nextResubmitAllowedAt(currentAllowedAt: number, now: number, cooldownMs: number): number {
  return Math.max(currentAllowedAt, now + cooldownMs);
}

/**
 * 残り時間を、画面に表示する秒数（切り上げ）にする。
 *
 * @param allowedAt 再送を受け付ける時刻（ミリ秒）
 * @param now 現在時刻（ミリ秒）
 * @returns 残り秒数。待ち時間が終わっていれば 0
 */
export function remainingSeconds(allowedAt: number, now: number): number {
  return Math.max(0, Math.ceil((allowedAt - now) / 1000));
}
