/**
 * お問い合わせフォームの入力チェック（STEP 4-B①）。
 *
 * 画面（components/contact/ContactForm.tsx）から切り離した「純粋な関数」だけを置く。
 * - 他のファイルを import しないため、Node.js 標準のテスト機能（node --test）でそのまま検証できる
 *   （lib/contact-validation.test.mjs）。
 * - ルール（必須・文字数・メール形式）はこのファイルだけを見れば分かるようにする。
 *
 * データの流れ：
 *   入力中の値（ContactFormValues）
 *   → normalizeContactForm（前後の空白を除く）
 *   → validateContactForm（エラー文の一覧を返す）
 *   → エラーが無ければ送信処理（lib/contact-submit.ts）へ
 *
 * 文字数の上限・下限は decision-log.md D-040 で確定した値。
 * エラー文は、エラーの一覧（エラーサマリー）だけを読んでも分かるよう、必ず項目名を含める。
 */

/** フォームの入力値。チェックボックス以外はすべて文字列で扱う */
export type ContactFormValues = {
  name: string;
  email: string;
  /** ご相談の種類（任意）。未選択は空文字 */
  category: string;
  message: string;
  /** 個人情報の取り扱いへの同意（必須） */
  consent: boolean;
};

/** 入力欄の名前。エラーの対応づけと、フォーカス移動の順番に使う */
export type ContactFieldName = keyof ContactFormValues;

/** 入力欄ごとのエラー文。エラーが無い欄はキー自体を持たない */
export type ContactFormErrors = Partial<Record<ContactFieldName, string>>;

/** 文字数の制限（D-040） */
export const CONTACT_LIMITS = {
  nameMax: 50,
  /** メールアドレスの一般的な最大長 */
  emailMax: 254,
  messageMin: 10,
  messageMax: 2000,
} as const;

/** ご相談の種類の選択肢（任意項目） */
export const CONTACT_CATEGORIES = ["新規制作", "コーディング", "修正・改善", "その他"] as const;

/** エラーを表示する順番（画面上の並び順と一致させる） */
export const CONTACT_FIELD_ORDER: readonly ContactFieldName[] = [
  "name",
  "email",
  "category",
  "message",
  "consent",
];

/** 空のフォーム（初期値） */
export const EMPTY_CONTACT_FORM: ContactFormValues = {
  name: "",
  email: "",
  category: "",
  message: "",
  consent: false,
};

/**
 * 入力に含めてはいけない文字。
 * - 制御文字（NUL など。お名前・メールアドレスでは改行・タブも含む）
 * - 文字の表示順を入れ替える制御文字（U+202A〜U+202E、U+2066〜U+2069）：
 *   通知メールの表示を偽装される（なりすまし）おそれがあるため（D-054）
 * ご相談内容では改行（LF）とタブだけを許可する。
 */
const SINGLE_LINE_FORBIDDEN = /[\u0000-\u001F\u007F\u202A-\u202E\u2066-\u2069]/;
const MULTI_LINE_FORBIDDEN = /[\u0000-\u0008\u000B-\u001F\u007F\u202A-\u202E\u2066-\u2069]/;

/**
 * 文字数を数える。
 *
 * JavaScript の `str.length` は絵文字などを2文字と数えてしまうため、
 * スプレッド構文で「見た目の1文字（コードポイント）」ごとに分けて数える。
 *
 * @param value 数える文字列
 * @returns 文字数
 */
export function countCharacters(value: string): number {
  return [...value].length;
}

/**
 * 前後の空白（全角スペース・改行を含む）を取り除いた値を返す。
 * 送信やチェックは、この値に対して行う。
 *
 * @param values 入力中の値
 * @returns 整えた値（元のオブジェクトは変更しない）
 */
export function normalizeContactForm(values: ContactFormValues): ContactFormValues {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    category: values.category.trim(),
    // 改行コードを LF にそろえ、ブラウザによる文字数の数え方の差をなくす
    message: values.message.replace(/\r\n?/g, "\n").trim(),
    consent: values.consent,
  };
}

/**
 * メールアドレスの形式として妥当かを判定する。
 *
 * 「@ の前後に空白以外の文字があり、@ の後ろに . を含む」程度の簡易な確認にとどめる。
 * 厳密な判定は難しく、正しいアドレスを誤って弾く方が問題が大きいため。
 * 最終的に届くかどうかは、返信時に確認することになる。
 *
 * @param email 前後の空白を除いたメールアドレス
 * @returns 形式が妥当なら true
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 1つの入力欄をチェックし、エラー文（無ければ undefined）を返す。
 * 「エラーが出た欄から離れたとき」の再チェックにも使う。
 *
 * @param field チェックする欄
 * @param values 前後の空白を除いた値（normalizeContactForm の結果）
 * @returns 日本語のエラー文、または undefined
 */
export function validateContactField(
  field: ContactFieldName,
  values: ContactFormValues,
): string | undefined {
  switch (field) {
    case "name": {
      if (values.name === "") return "お名前を入力してください。";
      if (SINGLE_LINE_FORBIDDEN.test(values.name)) return "お名前に使用できない文字が含まれています。";
      if (countCharacters(values.name) > CONTACT_LIMITS.nameMax) {
        return `お名前は${CONTACT_LIMITS.nameMax}文字以内で入力してください。`;
      }
      return undefined;
    }
    case "email": {
      if (values.email === "") return "メールアドレスを入力してください。";
      if (
        SINGLE_LINE_FORBIDDEN.test(values.email) ||
        countCharacters(values.email) > CONTACT_LIMITS.emailMax ||
        !isValidEmail(values.email)
      ) {
        return "メールアドレスの形式が正しくありません（例：name@example.com）。";
      }
      return undefined;
    }
    case "category": {
      // 任意項目。画面の選択肢以外の値が送られてきた場合だけエラーにする
      if (
        values.category !== "" &&
        !(CONTACT_CATEGORIES as readonly string[]).includes(values.category)
      ) {
        return "ご相談の種類を選択肢から選んでください。";
      }
      return undefined;
    }
    case "message": {
      if (values.message === "") return "ご相談内容を入力してください。";
      if (MULTI_LINE_FORBIDDEN.test(values.message)) return "ご相談内容に使用できない文字が含まれています。";
      const length = countCharacters(values.message);
      if (length < CONTACT_LIMITS.messageMin) {
        return `ご相談内容は${CONTACT_LIMITS.messageMin}文字以上で入力してください。`;
      }
      if (length > CONTACT_LIMITS.messageMax) {
        return `ご相談内容は${CONTACT_LIMITS.messageMax}文字以内で入力してください（現在${length}文字）。`;
      }
      return undefined;
    }
    case "consent": {
      if (!values.consent) return "個人情報の取り扱いに同意してください。";
      return undefined;
    }
  }
}

/**
 * フォーム全体をチェックする。
 *
 * @param values 入力中の値（関数の中で前後の空白を除いてからチェックする）
 * @returns 欄ごとのエラー文。エラーが無ければ空のオブジェクト
 */
export function validateContactForm(values: ContactFormValues): ContactFormErrors {
  const normalized = normalizeContactForm(values);
  const errors: ContactFormErrors = {};
  for (const field of CONTACT_FIELD_ORDER) {
    const message = validateContactField(field, normalized);
    if (message) errors[field] = message;
  }
  return errors;
}

/**
 * エラーが1つでもあるかを返す。
 *
 * @param errors validateContactForm の結果
 */
export function hasContactErrors(errors: ContactFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
