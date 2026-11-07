/**
 * lib/contact-validation.ts のテスト（Node.js 標準のテスト機能 node:test を使用）。
 *
 * 実行：npm test
 * - 追加のテスト用パッケージは使わない（D-043）。
 * - Node.js 22.18 以降は .ts ファイルを型注釈を取り除いてそのまま読み込めるため、
 *   このテストは .mjs で書き、テスト対象の .ts を拡張子付きで import する。
 *   （.ts で書くと、拡張子付きの import が TypeScript の型チェックでエラーになるため）
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONTACT_CATEGORIES,
  CONTACT_CATEGORY_LABELS,
  CONTACT_LIMITS,
  countCharacters,
  EMPTY_CONTACT_FORM,
  hasContactErrors,
  isValidEmail,
  normalizeContactForm,
  validateContactForm,
} from "./contact-validation.ts";

/** すべての必須項目が正しく入力された状態 */
const valid = {
  name: "テスト 太郎",
  email: "test@example.com",
  category: "",
  message: "Webサイトの制作について相談したいです。",
  consent: true,
};

describe("validateContactForm", () => {
  it("正しい入力ではエラーが無い", () => {
    assert.deepEqual(validateContactForm(valid), {});
    assert.equal(hasContactErrors(validateContactForm(valid)), false);
  });

  it("未入力の必須項目はすべてエラーになり、任意項目はエラーにならない", () => {
    const errors = validateContactForm(EMPTY_CONTACT_FORM);
    assert.deepEqual(Object.keys(errors), ["name", "email", "message", "consent"]);
    assert.equal(errors.category, undefined);
  });

  it("空白だけの入力は未入力として扱う（全角スペース・改行を含む）", () => {
    const errors = validateContactForm({ ...valid, name: "　 ", message: "\n  \n" });
    assert.equal(errors.name, "お名前を入力してください。");
    assert.equal(errors.message, "ご相談内容を入力してください。");
  });

  it("お名前は50文字まで可、51文字でエラー", () => {
    assert.equal(validateContactForm({ ...valid, name: "あ".repeat(50) }).name, undefined);
    assert.match(validateContactForm({ ...valid, name: "あ".repeat(51) }).name ?? "", /50文字以内/);
  });

  it("ご相談内容は10〜2000文字（前後の空白は数えない）", () => {
    assert.match(validateContactForm({ ...valid, message: "あ".repeat(9) }).message ?? "", /10文字以上/);
    assert.equal(validateContactForm({ ...valid, message: `  ${"あ".repeat(10)}  ` }).message, undefined);
    assert.equal(validateContactForm({ ...valid, message: "あ".repeat(2000) }).message, undefined);
    assert.match(
      validateContactForm({ ...valid, message: "あ".repeat(2001) }).message ?? "",
      /2000文字以内.*2001文字/,
    );
  });

  it("絵文字は1文字として数える", () => {
    assert.equal(countCharacters("😀😀"), 2);
    assert.equal(validateContactForm({ ...valid, name: "😀".repeat(50) }).name, undefined);
  });

  it("メールアドレスの形式を確認する", () => {
    for (const ok of ["a@example.co", "name.tag+x@example.co.jp", "  test@example.com  "]) {
      assert.equal(validateContactForm({ ...valid, email: ok }).email, undefined, ok);
    }
    for (const ng of ["test", "test@", "@example.com", "test@example", "te st@example.com", "a@b@example.com"]) {
      assert.match(validateContactForm({ ...valid, email: ng }).email ?? "", /形式が正しくありません/, ng);
    }
    const tooLong = `${"a".repeat(CONTACT_LIMITS.emailMax)}@example.com`;
    assert.equal(isValidEmail(tooLong), true);
    assert.match(validateContactForm({ ...valid, email: tooLong }).email ?? "", /形式/);
  });

  it("ご相談の種類は選択肢以外の値をエラーにする", () => {
    assert.equal(validateContactForm({ ...valid, category: "新規制作" }).category, undefined);
    assert.match(validateContactForm({ ...valid, category: "<script>" }).category ?? "", /選択肢/);
  });

  it("同意していないとエラーになる", () => {
    assert.match(validateContactForm({ ...valid, consent: false }).consent ?? "", /同意/);
  });

  it("HTMLのような文字列もそのまま文字として扱う（チェックで書き換えない）", () => {
    const html = '<img src=x onerror="alert(1)">相談内容のテストです';
    assert.equal(validateContactForm({ ...valid, message: html }).message, undefined);
    assert.equal(normalizeContactForm({ ...valid, message: html }).message, html);
  });
});

describe("normalizeContactForm", () => {
  it("前後の空白を除き、改行コードを LF にそろえ、元の値は変更しない", () => {
    const input = { ...valid, name: "  山田  ", message: "\r\n1行目\r\n2行目\r\n" };
    const result = normalizeContactForm(input);
    assert.equal(result.name, "山田");
    assert.equal(result.message, "1行目\n2行目");
    assert.equal(input.name, "  山田  ");
  });
});

describe("入力形式の防御（制御文字・表示順の制御文字・D-054）", () => {
  it("お名前・メールアドレスは改行・タブ・NUL・表示順の制御文字を受け付けない", () => {
    for (const bad of ["山田\n太郎", "山田\t太郎", "山田\u0000", "山田\u202E太郎", "\u2066山田"]) {
      assert.match(validateContactForm({ ...valid, name: bad }).name ?? "", /入力できない文字/, JSON.stringify(bad));
    }
    assert.match(validateContactForm({ ...valid, email: "test\n@example.com" }).email ?? "", /形式/);
    assert.match(validateContactForm({ ...valid, email: "te\u202Est@example.com" }).email ?? "", /形式/);
  });

  it("ご相談内容は改行・タブを許可し、それ以外の制御文字は受け付けない", () => {
    assert.equal(validateContactForm({ ...valid, message: "1行目\n2行目\tタブあり" }).message, undefined);
    assert.equal(validateContactForm({ ...valid, message: "1行目\r\n2行目の相談です" }).message, undefined);
    for (const bad of ["相談内容です\u0000です", "相談内容です\u0007です", "相談内容です\u202Eです"]) {
      assert.match(validateContactForm({ ...valid, message: bad }).message ?? "", /入力できない文字/, JSON.stringify(bad));
    }
  });

  it("極端に長い入力でも、エラー文を返すだけで処理が止まらない", () => {
    const started = Date.now();
    const errors = validateContactForm({ ...valid, name: "あ".repeat(100_000), message: "い".repeat(1_000_000) });
    assert.match(errors.name ?? "", /50文字以内/);
    assert.match(errors.message ?? "", /2000文字以内/);
    assert.ok(Date.now() - started < 2000);
  });
});

describe("ご相談の種類：画面の文言と送信する値（D-061）", () => {
  it("送信する値は従来どおり4種類のまま（送信データの形式を変えない）", () => {
    assert.deepEqual([...CONTACT_CATEGORIES], ["新規制作", "コーディング", "修正・改善", "その他"]);
  });
  it("画面の文言は、コーディングだけ補足を付け、他は送信する値と同じ", () => {
    assert.deepEqual(Object.keys(CONTACT_CATEGORY_LABELS), [...CONTACT_CATEGORIES]);
    assert.equal(CONTACT_CATEGORY_LABELS["コーディング"], "コーディング（デザインデータからの制作）");
    for (const value of ["新規制作", "修正・改善", "その他"]) assert.equal(CONTACT_CATEGORY_LABELS[value], value);
  });
  it("入力チェックは送信する値を受け付け、画面の文言そのものは値として受け付けない", () => {
    const valid = { name: "テスト 太郎", email: "test@example.com", category: "コーディング", message: "ご相談内容のテストです。", consent: true };
    assert.equal(validateContactForm(valid).category, undefined);
    assert.match(validateContactForm({ ...valid, category: CONTACT_CATEGORY_LABELS["コーディング"] }).category ?? "", /選択肢から選んで/);
  });
});
