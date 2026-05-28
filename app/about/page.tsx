import Link from "next/link";
import styles from "../styles/contact_about.module.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Commyfy",
  description: "About page for Commyfy web app",
};

export default function AboutPage() {
  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <h1 className={styles.heading}>About Me</h1>
        <div className="underline" />
        <p className={styles.text}>
          Hello — I'm building simple, clean websites with Next.js. This page is
          an example About page using a separate CSS module file (camelCase
          class names).
        </p>
        <p className={styles.text}>
          You can link to the contact page to get in touch.
        </p>
        <Link className={styles.linkButton} href="/contact">
          Contact me
        </Link>
      </section>
    </main>
  );
}
