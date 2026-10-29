import type { Project } from "@/types/project";
import { kiToHibiCaseStudy } from "./case-studies/ki-to-hibi";
import { mellowCoffeeCaseStudy } from "./case-studies/mellow-coffee";

/**
 * 自主制作の作品データ（仕様書 7章）。
 *
 * 配列の並び順がそのまま表示順になる。
 * 紹介文は仕様書に記載された「重点紹介」の範囲だけで書き、成果の数値などは書かない。
 *
 * 画像について（仮）：
 * 各サイトをローカルでビルドし、1440×900 の表示領域を撮影したスクリーンショット（1600×1000px）。
 * 画面内の写真の利用権が未確認のため、公開前に確認する（decision-log.md D-020）。
 *
 * 詳細ページ（/projects/[slug]）の文章は data/case-studies/ に作品ごとのファイルで管理する。
 * 作品を追加するときは、この配列に1件追加し、case-studies に1ファイル作るだけでよい
 * （一覧・詳細ページ・generateStaticParams はこの配列から自動で作られる）。
 */
export const projects: readonly Project[] = [
  {
    slug: "ki-to-hibi",
    title: "株式会社 木と日々",
    kind: "架空の住宅会社のWebサイト（複数ページ）",
    fictionLabel: "架空企業",
    summary: "情報設計と複数ページの構成、表示品質の確認に重点を置いて制作しました。",
    techs: ["Next.js", "React", "TypeScript"],
    siteUrl: "https://ki-to-hibi.pages.dev",
    thumbnail: {
      src: "/images/projects/ki-to-hibi/works-section.jpg",
      alt: "株式会社 木と日々（架空の住宅会社）のWebサイト。施工事例の一覧部分の画面",
      width: 1600,
      height: 1000,
    },
    featured: true,
    structure: [
      "トップ",
      "施工事例（一覧・詳細3件）",
      "お金のこと",
      "土地探し",
      "住宅性能",
      "私たちについて",
      "無料相談・来場予約",
    ],
    notes: ["問い合わせフォームはデモです。入力内容は送信・保存されません。"],
    caseStudy: kiToHibiCaseStudy,
  },
  {
    slug: "mellow-coffee",
    title: "MELLOW COFFEE",
    kind: "架空のカフェのランディングページ",
    fictionLabel: "架空店舗",
    summary: "世界観を伝えるビジュアルとLP構成、レスポンシブ対応に重点を置いて制作しました。",
    techs: ["HTML", "CSS", "JavaScript"],
    siteUrl: "https://mellow-coffee.pages.dev",
    thumbnail: {
      src: "/images/projects/mellow-coffee/hero-section.jpg",
      alt: "MELLOW COFFEE（架空のカフェ）のランディングページ。ファーストビューの画面",
      width: 1600,
      height: 1000,
    },
    featured: true,
    structure: ["HERO", "CONCEPT", "FOR FAMILY", "MENU", "SPACE", "FAQ", "ACCESS", "CTA"],
    notes: ["店舗の住所・営業時間・設備などは、すべて架空の設定です。"],
    caseStudy: mellowCoffeeCaseStudy,
  },
];

/** Home の Selected Projects に表示する作品 */
export const featuredProjects = projects.filter((project) => project.featured);

/**
 * Home の Hero に表示する代表作品の slug。
 * ファーストビューで印象を残すため、ビジュアルの強い MELLOW COFFEE を仮で選んでいる（decision-log.md D-017）。
 * 将来は自主開発プロダクト「MY SOLO」に差し替える予定（D-024）。差し替えはこの値と作品データの追加だけで行う。
 */
export const HERO_PROJECT_SLUG = "mellow-coffee";

/**
 * 作品が架空案件であることを伝える定型文を返す。
 * 詳細ページの冒頭・Overview・メタデータ（description）で同じ文言を使い、表記ゆれを防ぐ。
 *
 * @param project 対象の作品
 * @returns 例：「この作品は、架空の店舗を想定した自主制作です。実在の企業・店舗や受託案件ではありません。」
 */
export function getFictionNotice(project: Project): string {
  const target = project.fictionLabel === "架空企業" ? "架空の企業" : "架空の店舗";
  return `この作品は、${target}を想定した自主制作です。実在の企業・店舗や受託案件ではありません。`;
}

/**
 * slug から作品を探す。
 * Hero の代表作品と、詳細ページ（/projects/[slug]）で使う。
 *
 * @param slug 作品の識別子
 * @returns 該当する作品。見つからない場合は undefined
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
