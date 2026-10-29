import AboutPreview from "@/components/home/AboutPreview";
import Approach from "@/components/home/Approach";
import ContactCta from "@/components/home/ContactCta";
import Hero from "@/components/home/Hero";
import Journal from "@/components/home/Journal";
import SelectedProjects from "@/components/home/SelectedProjects";

/**
 * Home（/）。
 *
 * 仕様書 4章の順序（Hero → Selected Projects → Approach → About → Journal → Contact）で
 * セクションを並べるだけにし、各セクションの中身はそれぞれのコンポーネントに任せる。
 *
 * - すべて Server Component。Home には開閉・入力などブラウザ側の状態が不要なため（D-014）。
 * - <main> は layout.tsx 側にあるため、ここでは書かない（D-007）。
 * - ページの title は layout.tsx の default をそのまま使う。
 */
export default function Home() {
  return (
    <>
      <Hero />
      <SelectedProjects />
      <Approach />
      <AboutPreview />
      <Journal />
      <ContactCta />
    </>
  );
}
