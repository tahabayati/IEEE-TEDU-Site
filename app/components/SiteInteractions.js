"use client";

import { useEffect } from "react";
import { initializeSite } from "./site-interactions";

export default function SiteInteractions() {
  useEffect(() => {
    const cleanup = initializeSite();
    const form = document.getElementById("contact-form");
    const submit = (event) => {
      event.preventDefault();
      alert(
        "Mesajınız başarıyla alınmıştır. En kısa sürede ieee@tedu.edu.tr üzerinden dönüş sağlayacağız.",
      );
      window.location.href = "/";
    };
    form?.addEventListener("submit", submit);
    return () => {
      form?.removeEventListener("submit", submit);
      cleanup();
    };
  }, []);
  return null;
}
