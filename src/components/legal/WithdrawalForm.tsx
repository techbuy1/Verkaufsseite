"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

const inputClass =
  "w-full rounded-[12px] border border-border bg-white px-4 py-3 text-[14px] text-text-primary placeholder:text-text-secondary/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

type FormStatus = "idle" | "loading" | "success" | "error";

export function WithdrawalForm() {
  const searchParams = useSearchParams();
  const prefilledOrder = searchParams.get("order")?.trim() ?? "";

  const [name, setName] = useState("");
  const [orderNumber, setOrderNumber] = useState(prefilledOrder);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validateClient(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Bitte gib deinen Namen an.";
    if (!orderNumber.trim()) errors.orderNumber = "Bitte gib deine Bestellnummer an.";
    if (!email.trim()) {
      errors.email = "Bitte gib deine E-Mail-Adresse an.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Bitte gib eine gültige E-Mail-Adresse an.";
    }
    if (!confirmed) errors.confirmed = "Bitte bestätige deinen Widerruf.";
    return errors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const errors = validateClient();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus("error");
      setErrorMessage("Bitte prüfe die markierten Felder.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          orderNumber: orderNumber.trim(),
          email: email.trim(),
          reason: reason.trim(),
          confirmed: true,
        }),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setStatus("error");
        setErrorMessage(
          data.message ??
            "Technischer Fehler beim Übermitteln. Bitte versuche es später erneut.",
        );
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Technischer Fehler beim Übermitteln. Bitte versuche es später erneut.",
      );
    }
  }

  if (status === "success") {
    return (
      <div
        id="widerruf-formular"
        className="rounded-[16px] border border-accent/25 bg-accent-soft/40 p-5 md:p-6"
      >
        <p className="text-[18px] font-semibold text-text-primary">
          Dein Widerruf wurde übermittelt.
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">
          Wir haben deine Anfrage erhalten und prüfen sie schnellstmöglich.
        </p>
      </div>
    );
  }

  return (
    <form
      id="widerruf-formular"
      className="space-y-4 rounded-[16px] border border-border bg-surface-card p-5 shadow-[var(--shadow-card)] md:p-6"
      onSubmit={handleSubmit}
      noValidate
    >
      <div>
        <label htmlFor="withdrawal-name" className="mb-1.5 block text-[13px] font-medium text-text-primary">
          Name <span className="text-accent">*</span>
        </label>
        <input
          id="withdrawal-name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={inputClass}
          aria-invalid={Boolean(fieldErrors.name)}
        />
        {fieldErrors.name && (
          <p className="mt-1 text-[12px] text-accent">{fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="withdrawal-order"
          className="mb-1.5 block text-[13px] font-medium text-text-primary"
        >
          Bestellnummer <span className="text-accent">*</span>
        </label>
        <input
          id="withdrawal-order"
          type="text"
          required
          autoComplete="off"
          value={orderNumber}
          onChange={(event) => setOrderNumber(event.target.value)}
          className={inputClass}
          aria-invalid={Boolean(fieldErrors.orderNumber)}
        />
        {fieldErrors.orderNumber && (
          <p className="mt-1 text-[12px] text-accent">{fieldErrors.orderNumber}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="withdrawal-email"
          className="mb-1.5 block text-[13px] font-medium text-text-primary"
        >
          E-Mail-Adresse <span className="text-accent">*</span>
        </label>
        <input
          id="withdrawal-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={inputClass}
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email && (
          <p className="mt-1 text-[12px] text-accent">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="withdrawal-reason"
          className="mb-1.5 block text-[13px] font-medium text-text-primary"
        >
          Grund für den Widerruf <span className="text-text-secondary">(optional)</span>
        </label>
        <textarea
          id="withdrawal-reason"
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className={`${inputClass} resize-none`}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-[12px] border border-border bg-background-secondary/60 p-3.5">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-accent"
          aria-invalid={Boolean(fieldErrors.confirmed)}
        />
        <span className="text-[13px] leading-relaxed text-text-secondary">
          Ich möchte meine Bestellung widerrufen. <span className="text-accent">*</span>
        </span>
      </label>
      {fieldErrors.confirmed && (
        <p className="-mt-2 text-[12px] text-accent">{fieldErrors.confirmed}</p>
      )}

      {errorMessage && status === "error" && (
        <p className="rounded-[12px] border border-accent/30 bg-accent-soft/50 px-3.5 py-3 text-[13px] text-text-primary">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-[980px] bg-accent px-6 text-[14px] font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Wird übermittelt …" : "Widerruf absenden"}
      </button>
    </form>
  );
}
