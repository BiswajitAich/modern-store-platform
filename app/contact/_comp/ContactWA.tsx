"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "../../styles/contact_about.module.css";

const ContactWA = () => {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "000";
  const message = encodeURIComponent("Hi, I want to know more about Commyfy!");

  const waLink = `https://wa.me/${number}?text=${message}`;

  return (
    <Link
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.WAbutton}
    >
      <div>
        <Image
          src={"/whatsapp.png"}
          alt="WhatsApp"
          width={40}
          height={40}
          style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
        />
      </div>
      Contact on WhatsApp
    </Link>
  );
};

export default ContactWA;
