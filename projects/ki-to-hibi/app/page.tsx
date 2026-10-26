import styles from "./page.module.css"; 
import Hero from "@/components/home/Hero";
import Concept from "@/components/home/Concept";
import Promises from "@/components/home/Promises";
import Works from "@/components/home/Works";
import Money from "@/components/home/Money";
import LandPerformance from "@/components/home/LandPerformance";
import About from "@/components/home/About";
import Flow from "@/components/home/Flow";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <main className={styles.main}>
      <Hero />
      <Concept />
      <Promises />
      <Works />
      <Money />
      <LandPerformance />
      <About />
      <Flow />
      <FAQ />
      <FinalCTA />
    </main>
  );
}