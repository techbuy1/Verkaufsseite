"use client";

import { useState } from "react";
import { LegalPageLayout, LegalSection } from "@/components/legal/LegalPageLayout";
import {
  ORDER_NUMBER_HINT,
  SHOP_CONTACT_EMAIL,
  shopContactMailto,
} from "@/lib/shopContact";
import { companySettings } from "@/lib/companySettings";

const inputClass =
  "w-full rounded-[12px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export function ContactPageContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const mailtoHref = shopContactMailto({
    subject: subject || "Kontaktanfrage über TechBuy Shop",
    body: [
      message.trim(),
      "",
      "—",
      name.trim(),
      email.trim(),
      orderNumber.trim()
        ? `Bestellnummer: ${orderNumber.trim()}`
        : "Bestellnummer: (bitte angeben, falls vorhanden)",
    ].join("\n"),
  });

  return (
    <LegalPageLayout
      eyebrow="Kontakt"
      title="Sprich mit uns."
      intro="Fragen zu einer Bestellung, einem Gerät oder dem Ankauf? Wir helfen gern weiter."
    >
      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <LegalSection title="Direkt erreichbar">
          <p>
            Telefon:{" "}
            <a className="text-accent hover:underline" href={`tel:+49${companySettings.phone}`}>
              {companySettings.phone}
            </a>
          </p>
          <p>
            E-Mail:{" "}
            <a className="text-accent hover:underline" href={`mailto:${SHOP_CONTACT_EMAIL}`}>
              {SHOP_CONTACT_EMAIL}
            </a>
          </p>
          <p className="pt-2 text-[14px] text-text-secondary">{ORDER_NUMBER_HINT}</p>
          <p className="pt-2">
            {companySettings.companyName}
            <br />
            {companySettings.street}
            <br />
            {companySettings.postalCode} {companySettings.city}
          </p>
        </LegalSection>

        <LegalSection title="Nachricht senden">
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              window.location.href = mailtoHref;
            }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                required
                type="text"
                placeholder="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClass}
              />
              <input
                required
                type="email"
                placeholder="E-Mail-Adresse"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClass}
              />
            </div>
            <input
              type="text"
              placeholder="Bestellnummer (falls vorhanden)"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              className={inputClass}
              autoComplete="off"
            />
            <input
              type="text"
              placeholder="Betreff"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className={inputClass}
            />
            <textarea
              required
              placeholder="Deine Nachricht"
              rows={5}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className={`${inputClass} resize-none`}
            />
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-[980px] bg-accent px-6 text-[14px] font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Nachricht senden
            </button>
            <p className="pt-1 text-[12px] text-text-secondary/70">
              Öffnet dein E-Mail-Programm mit einer vorausgefüllten Nachricht an{" "}
              {SHOP_CONTACT_EMAIL}. {ORDER_NUMBER_HINT}
            </p>
          </form>
        </LegalSection>
      </div>
    </LegalPageLayout>
  );
}
