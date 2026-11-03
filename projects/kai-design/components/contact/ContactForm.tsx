"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  CONTACT_FAILURE_MESSAGES,
  getContactSubmitter,
  type ContactSubmitFailureReason,
  type ContactSubmitter,
} from "@/lib/contact-submit";
import {
  CONTACT_CATEGORIES,
  CONTACT_FIELD_ORDER,
  CONTACT_LIMITS,
  countCharacters,
  EMPTY_CONTACT_FORM,
  hasContactErrors,
  normalizeContactForm,
  validateContactField,
  validateContactForm,
  type ContactFieldName,
  type ContactFormErrors,
  type ContactFormValues,
} from "@/lib/contact-validation";
import FormField from "./FormField";
import styles from "./ContactForm.module.css";

/**
 * フォームの状態。
 * - idle：入力中
 * - submitting：送信中（ボタンを押せない）
 * - unavailable：入力は正しいが、送信先が未設定のため送れなかった（STEP 4-B① の状態）
 * - error：送信に失敗した（入力内容は残す）
 * - success：送信関数が成功を返した（このときだけ「受け付けました」と表示する）
 */
type FormStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "unavailable" }
  | { kind: "error"; reason: ContactSubmitFailureReason }
  | { kind: "success" };

/** 入力欄の id。エラーサマリーのリンク先にもなる */
const FIELD_IDS: Record<ContactFieldName, string> = {
  name: "contact-name",
  email: "contact-email",
  category: "contact-category",
  message: "contact-message",
  consent: "contact-consent",
};

type ContactFormProps = {
  /**
   * 送信関数。省略時は getContactSubmitter() の結果を使う（STEP 4-B① では null = 準備中）。
   * テスト時に成功・失敗を再現する送信関数を渡せるよう、外から差し替え可能にしている。
   */
  submitter?: ContactSubmitter | null;
};

/**
 * お問い合わせフォーム（Client Component）。
 *
 * 入力値・エラー・送信状態をブラウザ側で管理する必要があるため、ページの中でこの部品だけを
 * Client Component にしている（ページ本体の app/contact/page.tsx は Server Component）。
 *
 * 処理の流れ：
 * 1. 送信ボタン → validateContactForm（lib/contact-validation.ts）で全項目をチェック
 * 2. エラーがあれば、エラーサマリーを表示してそこへフォーカスを移す（送信しない）
 * 3. エラーが無ければ submitter を呼ぶ。submitter が無ければ「準備中」と表示する
 * 4. 結果が成功なら完了表示、失敗なら理由に応じたメッセージ（入力内容は残す）
 *
 * セキュリティ：入力値は React の {} 表示と value 属性でだけ扱い、HTML として挿入しない
 * （dangerouslySetInnerHTML は使わない）。エラーサマリーにも入力値は表示しない。
 */
export default function ContactForm({ submitter = getContactSubmitter() }: ContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_CONTACT_FORM);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  /** エラーサマリーを表示したら1回だけフォーカスを移すための目印 */
  const [summaryFocusRequest, setSummaryFocusRequest] = useState(0);

  // 二重送信の防止。state の更新は次の描画まで反映されないため、
  // 同じクリックの連打を確実に止めるには ref（すぐに値が変わる箱）で判定する。
  const submittingRef = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

  const isSubmitting = status.kind === "submitting";
  const errorFields = CONTACT_FIELD_ORDER.filter((field) => errors[field]);
  const messageLength = countCharacters(normalizeContactForm(values).message);

  // エラーサマリーが表示されたら、そこへフォーカスを移して読み上げさせる
  useEffect(() => {
    if (summaryFocusRequest > 0) summaryRef.current?.focus();
  }, [summaryFocusRequest]);

  // 送信が完了したら、完了メッセージの見出しへフォーカスを移す
  useEffect(() => {
    if (status.kind === "success") resultRef.current?.focus();
  }, [status.kind]);

  /** 入力のたびに値を更新する。チェックボックスだけは checked を使う */
  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const target = event.target;
    const field = target.name as ContactFieldName;
    const nextValue =
      target instanceof HTMLInputElement && target.type === "checkbox" ? target.checked : target.value;
    setValues((current) => ({ ...current, [field]: nextValue }));
    // 失敗・準備中のメッセージは、入力し直したら消す
    if (status.kind === "error" || status.kind === "unavailable") setStatus({ kind: "idle" });
  };

  /**
   * 欄から離れたときの再チェック（D-040：一度エラーが出た欄だけ）。
   * 入力の途中で毎回エラーを出すと入力の邪魔になるため、まだエラーが出ていない欄は確認しない。
   */
  const handleBlur = (field: ContactFieldName) => {
    if (!errors[field]) return;
    const message = validateContactField(field, normalizeContactForm(values));
    setErrors((current) => {
      const next = { ...current };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  };

  /** チェックボックスは変更した時点で再チェックする（フォーカスを外さずに直せるようにするため） */
  const handleConsentChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleChange(event);
    if (errors.consent && event.target.checked) {
      setErrors((current) => {
        const next = { ...current };
        delete next.consent;
        return next;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // ブラウザ標準の送信（ページ移動）を止め、この関数で処理する
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = validateContactForm(values);
    setErrors(nextErrors);
    if (hasContactErrors(nextErrors)) {
      setStatus({ kind: "idle" });
      setSummaryFocusRequest((count) => count + 1);
      return;
    }

    if (!submitter) {
      // 送信先が未設定。送っていないので「完了」とは表示しない
      setStatus({ kind: "unavailable" });
      return;
    }

    submittingRef.current = true;
    setStatus({ kind: "submitting" });
    try {
      const { name, email, category, message } = normalizeContactForm(values);
      const result = await submitter({ name, email, category, message });
      setStatus(result.ok ? { kind: "success" } : { kind: "error", reason: result.reason });
    } catch {
      // 送信関数の中で想定外の例外が起きた場合も、通信できなかったものとして扱う
      setStatus({ kind: "error", reason: "network" });
    } finally {
      submittingRef.current = false;
    }
  };

  /** エラーサマリーのリンク：該当の入力欄へフォーカスを移す */
  const focusField = (field: ContactFieldName) => {
    document.getElementById(FIELD_IDS[field])?.focus();
  };

  if (status.kind === "success") {
    return (
      <div className={styles.result} role="status">
        <h2 ref={resultRef} tabIndex={-1} className={styles.resultTitle}>
          お問い合わせを受け付けました
        </h2>
        <p>内容を確認のうえ、ご入力いただいたメールアドレスへご連絡します。</p>
      </div>
    );
  }

  return (
    <form className={styles.form} noValidate onSubmit={handleSubmit} aria-busy={isSubmitting}>
      {!submitter && (
        <p className={styles.notice}>
          現在、このフォームからの送信は準備中です。入力内容の確認はできますが、送信はされません。
        </p>
      )}

      {errorFields.length > 0 && (
        <div
          ref={summaryRef}
          className={styles.summary}
          tabIndex={-1}
          aria-labelledby="contact-error-summary-title"
        >
          <p id="contact-error-summary-title" className={styles.summaryTitle}>
            入力内容を確認してください（{errorFields.length}件）
          </p>
          <ul className={styles.summaryList}>
            {errorFields.map((field) => (
              <li key={field}>
                <a
                  href={`#${FIELD_IDS[field]}`}
                  className={styles.summaryLink}
                  onClick={(event) => {
                    event.preventDefault();
                    focusField(field);
                  }}
                >
                  {/* エラー文に項目名が含まれているため、項目名は重ねて書かない */}
                  {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <FormField id={FIELD_IDS.name} label="お名前" required hint={`${CONTACT_LIMITS.nameMax}文字以内`} error={errors.name}>
        {(controlProps) => (
          <input
            {...controlProps}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={handleChange}
            onBlur={() => handleBlur("name")}
            className={styles.input}
          />
        )}
      </FormField>

      <FormField id={FIELD_IDS.email} label="メールアドレス" required hint="返信先になります（例：name@example.com）" error={errors.email}>
        {(controlProps) => (
          <input
            {...controlProps}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            required
            value={values.email}
            onChange={handleChange}
            onBlur={() => handleBlur("email")}
            className={styles.input}
          />
        )}
      </FormField>

      <FormField id={FIELD_IDS.category} label="ご相談の種類" required={false} error={errors.category}>
        {(controlProps) => (
          <select
            {...controlProps}
            name="category"
            value={values.category}
            onChange={handleChange}
            onBlur={() => handleBlur("category")}
            className={styles.select}
          >
            <option value="">選択してください</option>
            {CONTACT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <FormField
        id={FIELD_IDS.message}
        label="ご相談内容"
        required
        hint={`${CONTACT_LIMITS.messageMin}〜${CONTACT_LIMITS.messageMax}文字`}
        error={errors.message}
        meta={
          // 文字数は入力のたびに変わるため、読み上げの割り込み（aria-live）はしない
          <span className={messageLength > CONTACT_LIMITS.messageMax ? styles.countOver : undefined}>
            {messageLength} / {CONTACT_LIMITS.messageMax}文字
          </span>
        }
      >
        {(controlProps) => (
          <textarea
            {...controlProps}
            name="message"
            rows={8}
            required
            value={values.message}
            onChange={handleChange}
            onBlur={() => handleBlur("message")}
            className={styles.textarea}
          />
        )}
      </FormField>

      <div className={styles.consent}>
        {errors.consent && (
          <p id="contact-consent-error" className={styles.consentError}>
            <span aria-hidden="true">！</span>
            {errors.consent}
          </p>
        )}
        <div className={styles.consentRow}>
          <input
            id={FIELD_IDS.consent}
            name="consent"
            type="checkbox"
            required
            checked={values.consent}
            onChange={handleConsentChange}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={
              [errors.consent ? "contact-consent-error" : "", "contact-consent-hint"].filter(Boolean).join(" ")
            }
            className={styles.checkbox}
          />
          <label htmlFor={FIELD_IDS.consent} className={styles.consentLabel}>
            個人情報の取り扱いに同意します
            <span className={styles.requiredBadge}>必須</span>
          </label>
        </div>
        {/* リンクはラベルの外に置き、押したときにチェックが切り替わらないようにする */}
        <p id="contact-consent-hint" className={styles.consentHint}>
          ご入力いただいた情報の扱いは「
          <Link href="/privacy" className={styles.inlineLink}>
            個人情報の取り扱い
          </Link>
          」をご確認ください。
        </p>
      </div>

      {status.kind === "unavailable" && (
        <p className={styles.statusMessage} role="status">
          現在、フォームからの送信は準備中です。<strong>入力内容は送信されていません。</strong>
        </p>
      )}
      {status.kind === "error" && (
        <p className={styles.errorMessage} role="alert">
          {CONTACT_FAILURE_MESSAGES[status.reason]}
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.submit}
          aria-disabled={isSubmitting || undefined}
        >
          {isSubmitting ? "送信中…" : "入力内容を送信する"}
        </button>
      </div>
    </form>
  );
}
