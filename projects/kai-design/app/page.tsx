import styles from "./page.module.css";

/**
 * Home（仮）。
 * 共通レイアウト確認用のプレースホルダー。Hero などの各セクションは次の STEP で実装する。
 * <main> は layout.tsx 側にあるため、ここでは書かない。
 */
export default function Home() {
  return (
    <div className={styles.placeholder}>
      <h1 className={styles.title}>Kai Design</h1>
      <p className={styles.text}>Homeページは次のSTEPで実装します。</p>
    </div>
  );
}
