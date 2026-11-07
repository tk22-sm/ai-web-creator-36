/**
 * lib/contact-cooldown.ts のテスト（Node.js 標準のテスト機能 node:test を使用）。
 * 実行：npm test
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getResubmitCooldownMs,
  nextResubmitAllowedAt,
  RATE_LIMIT_DEFAULT_COOLDOWN_MS,
  RATE_LIMIT_MAX_COOLDOWN_MS,
  RATE_LIMIT_MIN_COOLDOWN_MS,
  remainingSeconds,
  UNCERTAIN_COOLDOWN_MS,
} from "./contact-cooldown.ts";

describe("getResubmitCooldownMs（失敗の種類ごとの待ち時間・D-057）", () => {
  it("待ち時間の基本値", () => {
    assert.equal(UNCERTAIN_COOLDOWN_MS, 30_000);
    assert.equal(RATE_LIMIT_DEFAULT_COOLDOWN_MS, 60_000);
    assert.equal(RATE_LIMIT_MIN_COOLDOWN_MS, 30_000);
    assert.equal(RATE_LIMIT_MAX_COOLDOWN_MS, 600_000);
  });

  it("成功・受付拒否・フォームが見つからない・サーバーエラーは待ち時間なし", () => {
    assert.equal(getResubmitCooldownMs({ ok: true }), 0);
    for (const reason of ["rejected", "form-unavailable", "server"]) {
      assert.equal(getResubmitCooldownMs({ ok: false, reason }), 0, reason);
    }
  });

  it("届いたか分からない失敗（timeout・network）は30秒", () => {
    assert.equal(getResubmitCooldownMs({ ok: false, reason: "timeout" }), 30_000);
    assert.equal(getResubmitCooldownMs({ ok: false, reason: "network" }), 30_000);
  });

  it("429 は Retry-After が無ければ60秒", () => {
    assert.equal(getResubmitCooldownMs({ ok: false, reason: "rate-limited" }), 60_000);
  });

  it("429 の Retry-After は下限30秒・上限10分に収める（極端な値を信用しない）", () => {
    const cases = [
      [0, 30_000],
      [5_000, 30_000],
      [45_000, 45_000],
      [120_000, 120_000],
      [600_000, 600_000],
      [999_999_000, 600_000],
    ];
    for (const [retryAfterMs, expected] of cases) {
      assert.equal(getResubmitCooldownMs({ ok: false, reason: "rate-limited", retryAfterMs }), expected, String(retryAfterMs));
    }
  });
});

describe("nextResubmitAllowedAt・remainingSeconds", () => {
  it("すでに後の時刻が設定されていれば短くしない（30秒の制限中に429が来た場合など）", () => {
    assert.equal(nextResubmitAllowedAt(0, 1_000, 30_000), 31_000);
    assert.equal(nextResubmitAllowedAt(100_000, 1_000, 30_000), 100_000);
    assert.equal(nextResubmitAllowedAt(31_000, 10_000, 60_000), 70_000);
  });

  it("残り秒数は切り上げ、終わっていれば0", () => {
    assert.equal(remainingSeconds(0, 0), 0);
    assert.equal(remainingSeconds(60_000, 0), 60);
    assert.equal(remainingSeconds(60_000, 59_001), 1);
    assert.equal(remainingSeconds(60_000, 60_000), 0);
    assert.equal(remainingSeconds(60_000, 99_000), 0);
  });
});
