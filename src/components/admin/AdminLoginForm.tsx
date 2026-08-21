"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? "Anmeldung fehlgeschlagen.");
        setLoading(false);
        return;
      }

      const nextPath = searchParams.get("next");
      const target =
        nextPath && nextPath.startsWith("/admin") && !nextPath.startsWith("/admin/login")
          ? nextPath
          : "/admin";
      router.replace(target);
      router.refresh();
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[400px] space-y-4">
      <div>
        <label
          htmlFor="admin-username"
          className="mb-1.5 block text-[13px] font-medium text-text-primary"
        >
          Benutzername
        </label>
        <input
          id="admin-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="mb-1.5 block text-[13px] font-medium text-text-primary"
        >
          Passwort
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[14px] text-text-primary outline-none transition-colors focus:border-accent"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-techbuy-primary flex h-11 w-full items-center justify-center !text-[14px] disabled:opacity-60"
      >
        {loading ? "Wird angemeldet…" : "Anmelden"}
      </button>
    </form>
  );
}
