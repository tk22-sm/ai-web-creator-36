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
    for (const ok of ["a@b.co", "name.tag+x@example.co.jp", "  test@example.com  "]) {
      assert.equal(validateContactForm({ ...valid, email: ok }).email, undefined, ok);
    }
    for (const ng of ["test", "test@", "@example.com", "test@example", "te st@example.com", "a@b@c.com"]) {
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
