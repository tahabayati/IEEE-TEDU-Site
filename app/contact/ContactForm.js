"use client";

import { useActionState } from "react";
import styles from "./page.module.css";
import { sendMessageAction } from "./actions";

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendMessageAction, null);

  if (state?.ok) {
    return <p className={styles.subtitle} role="status">Mesajınız bize ulaştı. En kısa sürede dönüş yapacağız. Teşekkürler!</p>;
  }
  return (
    <form action={action} id="contact-form">
      {state?.error && <p role="alert" className={styles.error}>{state.error}</p>}
      <div className={styles.group}>
        <label className={styles.label} htmlFor="name">Adınız Soyadınız</label>
        <input type="text" id="name" name="name" className={styles.input} placeholder="Örn. Ahmet Yılmaz" required maxLength={100} />
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="email">E-Posta Adresiniz</label>
        <input type="email" id="email" name="email" className={styles.input} placeholder="ornek@sirket.com" required maxLength={200} />
      </div>

      <div className={styles.group}>
        <label className={styles.label} htmlFor="message">Mesajınız</label>
        <textarea id="message" name="message" className={styles.input} placeholder="Detayları buraya yazabilirsiniz..." required minLength={5} maxLength={5000}></textarea>
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.trap} />

      <button type="submit" className={`btn btn-primary ${styles.submit}`} disabled={pending}>
        {pending ? "GÖNDERİLİYOR…" : "MESAJI GÖNDER"}
      </button>
    </form>
  );
}
