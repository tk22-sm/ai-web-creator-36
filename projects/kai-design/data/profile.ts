/**
 * About ページ（/about）に表示するプロフィール情報（STEP 4-A）。
 *
 * - すべて本人確認済みの内容（2026-10-29 確定。decision-log.md D-036〜D-039）。
 *   未確認の情報（経験年数・熟練度・資格・スクール名・受講時期など）は書かない。
 * - 公開表示名は「Kai Design」。本名・顔写真・勤務先・顧客名・案件名は書かない。
 * - 公開しない「今後の学習・サービス拡張候補」はこのファイルに入れず、decision-log にだけ記録する
 *   （画面に出さないデータをコードに置くと、誤って表示されたり使われないまま残ったりするため）。
 *
 * Home の「私について」（components/home/AboutPreview.tsx）は役割の異なる要約文として独立して管理する（D-037）。
 * 経歴の事実（年月・内容）を変えるときは、AboutPreview の記載とずれていないかも確認すること。
 */

/** 経歴の1項目 */
export type ExperienceItem = {
  /** 時期または区分（例：「2021年4月〜」） */
  term: string;
  /** 内容 */
  description: string;
};

/** スキルのまとまり */
export type SkillGroup = {
  /** まとまりの名前（例：「コーディング」） */
  label: string;
  /** 技術名・ツール名。経験年数や熟練度は付けない */
  items: readonly string[];
};

/** Kai Design として個人で提供するサービス */
export type Service = {
  title: string;
  description: string;
};

/**
 * 自己紹介文（Profile）。本人が書いた3段落を原文のまま掲載する（D-036）。
 * 文言を変更する場合は、必ず本人の確認を取ること。
 */
export const profileIntroduction: readonly string[] = [
  "業務システムの開発・設計・テストに携わるエンジニアとして働きながら、個人でWebサイトの制作に取り組んでいます。",
  "UI/UXデザインの学習を通じて、見た目の美しさだけでなく、情報の伝わりやすさや使いやすさを意識した制作を大切にしています。",
  "サービスや事業の魅力を理解し、必要としている人にきちんと届くWebサイトを目指しています。",
];

/**
 * 経歴（Experience）。会社員としての本業の経験であり、Kai Design の制作実績ではない（D-038）。
 * 会社名・顧客名・案件名・スクール名・受講時期は掲載しない。
 */
export const experiences: readonly ExperienceItem[] = [
  { term: "2021年4月〜", description: "業務システムの開発・設計・テストに従事" },
  { term: "2026年4月〜", description: "要件定義・テスト推進を担当" },
  { term: "学習", description: "UI/UXデザインスクールで6か月間学習・制作" },
];

/** スキル（Skills）。技術名・ツール名だけを並べる（D-038） */
export const skillGroups: readonly SkillGroup[] = [
  { label: "コーディング", items: ["HTML", "CSS", "JavaScript"] },
  { label: "フレームワーク・言語", items: ["React", "Next.js", "TypeScript"] },
  { label: "デザインツール", items: ["Figma", "Illustrator", "Photoshop"] },
];

/** What I Can Do のリード文（確定文） */
export const servicesLead =
  "Kai Designとして、個人で次のようなWebサイト制作に対応しています。ご相談内容に合わせて、進め方を一緒に考えます。";

/**
 * What I Can Do（確定した4項目のみ。D-039）。
 * 実績の多さや熟練度を示す表現（「経験豊富」「多数の実績」「プロの」など）は使わない。
 */
export const services: readonly Service[] = [
  {
    title: "デザインからのWebサイト制作",
    description: "目的や伝えたい内容を整理し、デザインからコーディングまで一貫して制作します。",
  },
  {
    title: "デザインデータからのコーディング",
    description:
      "Figmaなどのデザインデータをもとに、HTML / CSS / JavaScriptでWebサイトを形にします。",
  },
  {
    title: "スマートフォン・タブレット対応",
    description:
      "画面の幅に合わせてレイアウトを組み替え、どの端末でも見やすく操作しやすい表示に整えます。",
  },
  {
    title: "既存Webサイトの修正・改善",
    description:
      "文言や画像の差し替え、レイアウトの調整など、今あるWebサイトの修正・改善に対応します。",
  },
];
