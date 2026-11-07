"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from "react";
import {
  CONTACT_FAILURE_MESSAGES,
  RESUBMIT_COOLDOWN_MESSAGE,
  getContactFormMode,
  getContactSubmitter,
  type ContactFormMode,
  type ContactSubmitFailureReason,
  type ContactSubmitResult,
  type ContactSubmitter,
} from "@/lib/contact-submit";
import { getResubmitCooldownMs, nextResubmitAllowedAt, remainingSeconds } from "@/lib/contact-cooldown";
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
 * - unavailable：入力は正しいが、送信先が未設定のため送れなかった
 * - error：送信に失敗した（入力内容は残す）
 * - cooldown：待ち時間中に送信しようとした（届いたか分からない失敗・送信回数の上限のあと。D-052・D-057）
 * - success：送信関数が成功を返した（このときだけ「受け付けました」と表示する）
 */
type FormStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "unavailable" }
  | { kind: "error"; reason: ContactSubmitFailureReason }
  | { kind: "cooldown" }
  | { kind: "success" };

/** 入力欄の id。エラーサマリーのリンク先にもなる */
const FIELD_IDS: Record<ContactFieldName, string> = {
  name: "contact-name",
  email: "contact-email",
  category: "contact-category",
  message: "contact-message",
  consent: "contact-consent",
};

/** 送信の準備中（JavaScript の読み込み前・読み込み失敗・無効）であることを伝える文の id */
const NOT_READY_HINT_ID = "contact-submit-not-ready";

/** useSyncExternalStore 用：変化を通知しない購読関数（JavaScript が動き出したかどうかだけを知るため） */
const subscribeNothing = () => () => {};

/**
 * JavaScript が動き出した（Hydration が終わった）かどうか。
 * サーバーでの HTML 生成時と Hydration 中は false、その後は true になる（D-060）。
 * Hydration の前後で描画内容が食い違わないよう、useEffect ではなく useSyncExternalStore で判定する。
 */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

type ContactFormProps = {
  /**
   * 送信関数。省略時は getContactSubmitter() の結果を使う
   * （フォームIDが環境変数に設定されていれば Formspree、未設定なら null = 準備中）。
   * テスト時に成功・失敗を再現する送信関数を渡せるよう、外から差し替え可能にしている。
   */
  submitter?: ContactSubmitter | null;
  /** 接続状態。省略時は getContactFormMode() の結果（"test" のときは画面に「テスト用」と表示する） */
  mode?: ContactFormMode;
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
export default function ContactForm({
  submitter = getContactSubmitter(),
  mode = getContactFormMode(),
}: ContactFormProps) {
  const isHydrated = useIsHydrated();
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
  /** 隠し入力欄（ハニーポット）。値は state に持たず、送信時に直接読む（人は入力しないため） */
  const honeypotRef = useRef<HTMLInputElement>(null);
  /**
   * 再送を受け付ける時刻（ミリ秒。0 なら制限なし）。送信の可否の判定はすぐに値が変わる ref で行い、
   * 残り秒数の表示には state を使う（D-057）。
   */
  const resubmitAllowedAtRef = useRef(0);
  const [resubmitAllowedAt, setResubmitAllowedAt] = useState(0);
  /** 残り秒数の表示用の現在時刻。待ち時間中だけ1秒ごとに更新する（描画中に Date.now() を呼ばないため） */
  const [now, setNow] = useState(0);

  const isSubmitting = status.kind === "submitting";
  /** 準備中の案内を出すか（JavaScript が動き出す前で、送信先が設定されているときだけ） */
  const showNotReadyHint = !isHydrated && submitter !== null;
  const cooldownSeconds = remainingSeconds(resubmitAllowedAt, now);
  const isCoolingDown = cooldownSeconds > 0;
  const errorFields = CONTACT_FIELD_ORDER.filter((field) => errors[field]);
  const messageLength = countCharacters(normalizeContactForm(values).message);

  // 待ち時間中だけ、残り秒数の表示を1秒ごとに更新する。待ち時間が終わったら止める
  useEffect(() => {
    if (resubmitAllowedAt === 0) return;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= resubmitAllowedAt) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [resubmitAllowedAt]);

  /**
   * 送信結果に応じて、再送までの待ち時間を設定する（lib/contact-cooldown.ts で長さを決める）。
   * すでに設定されている待ち時間より短くはしない。
   */
  const applyResubmitCooldown = (result: ContactSubmitResult) => {
    const cooldownMs = getResubmitCooldownMs(result);
    if (cooldownMs === 0) return;
    const current = Date.now();
    const allowedAt = nextResubmitAllowedAt(resubmitAllowedAtRef.current, current, cooldownMs);
    resubmitAllowedAtRef.current = allowedAt;
    setResubmitAllowedAt(allowedAt);
    setNow(current);
  };

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
    if (status.kind === "error" || status.kind === "unavailable" || status.kind === "cooldown") {
      setStatus({ kind: "idle" });
    }
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

    // 届いたか分からない失敗・送信回数の上限の直後は、一定時間は送らない（D-052・D-057）
    if (Date.now() < resubmitAllowedAtRef.current) {
      setStatus({ kind: "cooldown" });
      return;
    }

    submittingRef.current = true;
    setStatus({ kind: "submitting" });
    try {
      const { name, email, category, message } = normalizeContactForm(values);
      const honeypot = honeypotRef.current?.value ?? "";
      const result = await submitter({ name, email, category, message, honeypot });
      applyResubmitCooldown(result);
      setStatus(result.ok ? { kind: "success" } : { kind: "error", reason: result.reason });
    } catch {
      // 送信関数の中で想定外の例外が起きた場合も、通信できなかった（届いたか分からない）ものとして扱う
      applyResubmitCooldown({ ok: false, reason: "network" });
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
    // method="post"：万一ブラウザ標準の送信が起きても、入力内容が URL（閲覧履歴・アクセスログ）に付かないようにする。
    // 標準の送信そのものは、送信ボタンの disabled（下記）と CSP の form-action 'none' で止める（D-060）。
    <form className={styles.form} method="post" noValidate onSubmit={handleSubmit} aria-busy={isSubmitting}>
      {!submitter && (
        <p className={styles.notice}>
          現在、このフォームからの送信は準備中です。入力内容の確認はできますが、送信はされません。
        </p>
      )}
      {/* テスト用フォームに接続したビルド（ローカル・プレビュー）だけに表示する。本番（production）では表示しない */}
      {submitter && mode === "test" && (
        <p className={styles.notice}>
          このフォームはテスト用の送信先に接続されています。動作確認以外の目的では送信しないでください。
        </p>
      )}

      {/*
        ハニーポット（_gotcha）：ボットだけが入力しやすい隠し入力欄（Formspree 公式の仕組み。D-047）。
        display: none で画面・Tab 移動・読み上げのすべてから外し、人が誤って入力しないようにする。
        CSS が読み込まれなかった場合に備えて、ラベルで「空のままに」と案内する。
      */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-gotcha">この欄は空のままにしてください</label>
        <input
          ref={honeypotRef}
          id="contact-gotcha"
          name="_gotcha"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

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
      {status.kind === "cooldown" && (
        <p className={styles.statusMessage} role="status">
          {RESUBMIT_COOLDOWN_MESSAGE}
        </p>
      )}

      <div className={styles.actions}>
        {/*
          準備中の案内（JavaScript が動き出す前だけ表示し、動き出したら消す。D-060）。
          送信先が未設定のビルドでは、フォーム上部の「送信は準備中です」の案内と重なるため表示しない
          （送信ボタンの disabled は、送信先の有無に関係なく維持する）。
          送信ボタンの直前に置き、読み上げの順番でもボタンより先に読まれるようにする。
          ボタンの aria-describedby でも関連付ける（disabled の間はボタンに Tab で移動できないため、両方で伝える）。
        */}
        {showNotReadyHint && (
          <div id={NOT_READY_HINT_ID} className={styles.preparing}>
            <p className={styles.preparingTitle}>
              <span className={styles.preparingDot} aria-hidden="true" />
              お問い合わせフォームの準備中です
            </p>
            <p>ただいま送信の準備をしています。少しお待ちください。</p>
            <p>準備が完了しない場合は、ページを再読み込みしてください。</p>
          </div>
        )}
        {/*
          JavaScript が動き出す前（読み込み前・読み込み失敗・無効）は disabled にする。
          既定の送信ボタンが disabled のフォームは、クリックでも Enter キーでも送信されない（HTML の仕様）。
          そのため、ブラウザ標準の送信で入力内容がページ移動に使われることはない（D-060）。
          動き出した後の送信中・待ち時間中は aria-disabled で「押せない」ことを伝える
          （disabled にするとフォーカスが外れるため使わない）。押された場合も handleSubmit 側で送信しない。
        */}
        <button
          type="submit"
          className={styles.submit}
          disabled={!isHydrated}
          aria-describedby={showNotReadyHint ? NOT_READY_HINT_ID : undefined}
          aria-disabled={isSubmitting || isCoolingDown || undefined}
        >
          {isSubmitting
            ? "送信中…"
            : isCoolingDown
              ? `あと${cooldownSeconds}秒で送信できます`
              : "入力内容を送信する"}
        </button>
      </div>
    </form>
  );
}
