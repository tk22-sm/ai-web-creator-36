import type { Project } from "@/types/project";

/**
 * 自主制作の作品データ（仕様書 7章）。
 *
 * 配列の並び順がそのまま表示順になる。
 * 紹介文は仕様書に記載された「重点紹介」の範囲だけで書き、成果の数値などは書かない。
 *
 * 画像について（仮）：
 * 各サイトをローカルでビルドし、1440×900 の表示領域を撮影したスクリーンショット（1600×1000px）。
 * 画面内の写真の利用権が未確認のため、公開前に確認する（decision-log.md D-020）。
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
 * slug から作品を探す。
 * Hero で代表作品の画像を表示するために使う（STEP 3 の詳細ページでも使う想定）。
 *
 * @param slug 作品の識別子
 * @returns 該当する作品。見つからない場合は undefined
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
