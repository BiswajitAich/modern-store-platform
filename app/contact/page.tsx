import ContactWA from "./_comp/ContactWA";
import styles from "../styles/contact_about.module.css";
import Link from "next/link";

export const metadata = {
  title: "Contact — Commyfy",
  description: "Contact page for Commyfy web app",
};
export default function ContactPage() {
  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <h1 className={styles.heading}>Contact</h1>
        <div className="underline" />
        <p className={styles.text}>
          Have a question or want to collaborate? Send a message on whatsapp.
        </p>

        <ContactWA />

        <p className={styles.text}>
          Or email directly:{" "}
          <Link href="mailto:hello@example.com" className={styles.email}>
            ....@gmail.com
          </Link>
        </p>
      </section>
    </main>
  );
}
