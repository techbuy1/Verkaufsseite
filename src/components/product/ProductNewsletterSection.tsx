"use client";

import { useState } from "react";

export function ProductNewsletterSection() {
  const [email, setEmail] = useState("");

  return (
    <section className="mt-10 bg-background-secondary pt-10 pb-12 md:mt-12 md:pt-12 md:pb-14">
      <div className="mx-auto max-w-[640px] px-5 text-center md:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          Newsletter
        </p>
        <h2 className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-text-primary md:text-[32px]">
          Keine Deals verpassen
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
          Exklusive Angebote, neue Produkte und Tech-News direkt in dein Postfach.
        </p>

        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
          onSubmit={(e) => {
            e.preventDefault();
            setEmail("");
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail-Adresse"
            required
            className="min-h-[48px] flex-1 rounded-full border border-border bg-white px-5 text-[15px] text-text-primary outline-none placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/20 sm:max-w-[320px]"
          />
          <button
            type="submit"
            className="btn-techbuy-primary min-h-[48px] px-8 text-[15px]"
          >
            Anmelden
          </button>
        </form>
      </div>
    </section>
  );
}
