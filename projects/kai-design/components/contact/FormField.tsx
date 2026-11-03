import type { ReactNode } from "react";
import styles from "./FormField.module.css";

/** 入力欄に付けるアクセシビリティ用の属性。FormField が組み立てて children に渡す */
export type FieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

type FormFieldProps = {
  /** 入力欄の id。ラベルの htmlFor と、エラーサマリーからのリンク先に使う */
  id: string;
  /** ラベル（画面に常に表示する） */
  label: string;
  /** 必須なら true。「必須」「任意」を文字で表示する（色だけに頼らない） */
  required: boolean;
  /** 入力のヒント（例：「50文字以内」）。任意 */
  hint?: string;
  /** エラー文。エラーが無いときは undefined */
  error?: string;
  /** 入力欄の右下に出す補足（文字数カウンターなど）。任意 */
  meta?: ReactNode;
  /**
   * 入力欄を描画する関数。FormField が作った属性（id・aria-describedby・aria-invalid）を受け取り、
   * <input> や <textarea> にそのまま渡す。
   */
  children: (controlProps: FieldControlProps) => ReactNode;
};

/**
 * ラベル・必須表示・ヒント・エラー文・入力欄を1組にまとめる部品。
 *
 * - <label htmlFor> で入力欄と結び付け、ラベルを押しても入力欄にフォーカスが移るようにする。
 * - ヒントとエラー文は aria-describedby で入力欄に結び付け、読み上げソフトが入力欄と一緒に読む。
 * - エラーがあるときは aria-invalid を付け、枠線の色とエラー文の両方で示す。
 *
 * Server Component としても使えるが、実際には ContactForm（Client Component）の中で使う。
 */
export default function FormField({ id, label, required, hint, error, meta, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        <span className={required ? styles.required : styles.optional}>
          {required ? "必須" : "任意"}
        </span>
      </label>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {/* エラー文は入力欄の上に置き、入力欄より先に目に入るようにする */}
      {error && (
        <p id={errorId} className={styles.error}>
          <span aria-hidden="true">！</span>
          {error}
        </p>
      )}
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {meta && <div className={styles.meta}>{meta}</div>}
    </div>
  );
}
