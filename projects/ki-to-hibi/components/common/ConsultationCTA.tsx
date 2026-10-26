import Link from "next/link";
import styles from "./ConsultationCTA.module.css";

type ConsultationCTAProps = {
  title: string;
  description: string;
};

export default function ConsultationCTA({
  title,
  description,
}: ConsultationCTAProps) {
  return (
    <section className={styles.consultation}>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link href="/contact" className={styles.contactLink}>
        無料相談・来場予約 →
      </Link>
    </section>
  );
}