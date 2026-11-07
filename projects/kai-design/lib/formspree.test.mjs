/**
 * lib/formspree.ts のテスト（Node.js 標準のテスト機能 node:test を使用）。
 *
 * 実行：npm test
 * - Formspree へは一切通信しない。fetch は毎回テスト用の偽物（モック）を渡す。
 * - 念のため globalThis.fetch も「呼ばれたら失敗する関数」に置き換え、実通信が起きないことを保証する。
 */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  buildFormspreePayload,
  classifyFormspreeStatus,
  createFormspreeSubmitter,
  FORMSPREE_ENDPOINT_BASE,
  resolveFormspreeConfig,
} from "./formspree.ts";

const submission = {
  name: "テスト 太郎",
  email: "test@example.com",
  category: "新規制作",
  message: "Webサイトの制作について相談したいです。",
  honeypot: "",
};

/** 指定したステータスで応答する偽の fetch。呼ばれた内容を calls に記録する */
function mockFetch(status, calls = []) {
  const fn = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(status < 300 ? { next: "/thanks", ok: true } : { errors: [] }), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
  fn.calls = calls;
  return fn;
}

const realFetch = globalThis.fetch;
const consoleMethods = ["log", "info", "warn", "error", "debug"];
const originalConsole = {};
let consoleCalls;

beforeEach(() => {
  // 実際の通信が起きたらテストを失敗させる
  globalThis.fetch = () => {
    throw new Error("実際の fetch が呼ばれました（テストでは禁止）");
  };
  // ログ出力を記録する（個人情報をログに出さないことの確認）
  consoleCalls = [];
  for (const m of consoleMethods) {
    originalConsole[m] = console[m];
    console[m] = (...args) => consoleCalls.push([m, ...args]);
  }
});

afterEach(() => {
  globalThis.fetch = realFetch;
  for (const m of consoleMethods) console[m] = originalConsole[m];
});

describe("resolveFormspreeConfig（環境変数の解釈）", () => {
  it("フォームIDが未設定・空・空白だけなら null（送信しない）", () => {
    assert.equal(resolveFormspreeConfig(undefined, undefined), null);
    assert.equal(resolveFormspreeConfig("", "production"), null);
    assert.equal(resolveFormspreeConfig("   ", "test"), null);
  });

  it("英数字以外を含む値は不正として null（URLの書き換えを防ぐ）", () => {
    for (const bad of ["abc/def", "abc?x=1", "../evil", "abc def", "abc#x", "ab", "a".repeat(33)]) {
      assert.equal(resolveFormspreeConfig(bad, "test"), null, bad);
    }
  });

  it("production と明示したときだけ本番扱い、それ以外は test 扱い", () => {
    assert.deepEqual(resolveFormspreeConfig("abcd1234", "production"), { formId: "abcd1234", environment: "production" });
    assert.deepEqual(resolveFormspreeConfig(" abcd1234 ", "test"), { formId: "abcd1234", environment: "test" });
    assert.equal(resolveFormspreeConfig("abcd1234", undefined).environment, "test");
    assert.equal(resolveFormspreeConfig("abcd1234", "prod").environment, "test");
    assert.equal(resolveFormspreeConfig("abcd1234", "PRODUCTION").environment, "test");
  });
});

describe("buildFormspreePayload（送信データ）", () => {
  it("email・subject・_gotcha を含み、同意の値は含まない", () => {
    const payload = buildFormspreePayload(submission);
    assert.deepEqual(payload, {
      name: "テスト 太郎",
      email: "test@example.com",
      category: "新規制作",
      message: "Webサイトの制作について相談したいです。",
      subject: "Kai Design お問い合わせ（新規制作）",
      _gotcha: "",
    });
    assert.equal("consent" in payload, false);
  });

  it("ご相談の種類が未選択なら件名に「種類未選択」と入る", () => {
    assert.equal(buildFormspreePayload({ ...submission, category: "" }).subject, "Kai Design お問い合わせ（種類未選択）");
  });
});

describe("classifyFormspreeStatus（失敗理由の判定）", () => {
  it("429 は回数制限、その他の 4xx は受付拒否、5xx はサーバーエラー", () => {
    assert.equal(classifyFormspreeStatus(429), "rate-limited");
    for (const s of [400, 403, 404, 422]) assert.equal(classifyFormspreeStatus(s), "rejected", String(s));
    for (const s of [500, 502, 503]) assert.equal(classifyFormspreeStatus(s), "server", String(s));
  });
});

describe("createFormspreeSubmitter（送信処理・fetch はモック）", () => {
  it("正しいURL・メソッド・ヘッダー・JSON本文で送信し、2xx なら成功", async () => {
    const fetchImpl = mockFetch(200);
    const result = await createFormspreeSubmitter("abcd1234", { fetchImpl })(submission);
    assert.deepEqual(result, { ok: true });
    assert.equal(fetchImpl.calls.length, 1);
    const { url, init } = fetchImpl.calls[0];
    assert.equal(url, `${FORMSPREE_ENDPOINT_BASE}abcd1234`);
    assert.equal(url, "https://formspree.io/f/abcd1234");
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Accept, "application/json");
    assert.equal(init.headers["Content-Type"], "application/json");
    assert.deepEqual(JSON.parse(init.body), buildFormspreePayload(submission));
    assert.ok(init.signal instanceof AbortSignal);
  });

  it("429 は rate-limited", async () => {
    assert.deepEqual(await createFormspreeSubmitter("abcd1234", { fetchImpl: mockFetch(429) })(submission), {
      ok: false,
      reason: "rate-limited",
    });
  });

  it("4xx（422・404）は rejected、5xx は server", async () => {
    for (const [status, reason] of [[422, "rejected"], [404, "rejected"], [500, "server"], [503, "server"]]) {
      const result = await createFormspreeSubmitter("abcd1234", { fetchImpl: mockFetch(status) })(submission);
      assert.deepEqual(result, { ok: false, reason }, String(status));
    }
  });

  it("通信できない（fetch が例外）は network", async () => {
    const fetchImpl = async () => {
      throw new TypeError("Failed to fetch");
    };
    assert.deepEqual(await createFormspreeSubmitter("abcd1234", { fetchImpl })(submission), {
      ok: false,
      reason: "network",
    });
  });

  it("時間内に応答が無ければ中止して timeout", async () => {
    let aborted = false;
    // 応答を返さず、中止されたときだけ例外を投げる偽の fetch
    const fetchImpl = (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => {
          aborted = true;
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      });
    const started = Date.now();
    const result = await createFormspreeSubmitter("abcd1234", { fetchImpl, timeoutMs: 50 })(submission);
    assert.deepEqual(result, { ok: false, reason: "timeout" });
    assert.equal(aborted, true);
    assert.ok(Date.now() - started < 2000);
  });

  it("送信データ・エラー内容をログに出力しない", async () => {
    await createFormspreeSubmitter("abcd1234", { fetchImpl: mockFetch(200) })(submission);
    await createFormspreeSubmitter("abcd1234", { fetchImpl: mockFetch(500) })(submission);
    await createFormspreeSubmitter("abcd1234", {
      fetchImpl: async () => {
        throw new TypeError("Failed to fetch");
      },
    })(submission);
    assert.deepEqual(consoleCalls, []);
  });

  it("fetch を省略したときは送信のたびにグローバルの fetch を使う（モックで確認）", async () => {
    const fetchImpl = mockFetch(200);
    globalThis.fetch = fetchImpl;
    const result = await createFormspreeSubmitter("abcd1234")(submission);
    assert.deepEqual(result, { ok: true });
    assert.equal(fetchImpl.calls.length, 1);
  });
});
