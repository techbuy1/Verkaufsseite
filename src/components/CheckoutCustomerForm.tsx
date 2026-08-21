"use client";

import type { CheckoutCustomerInput } from "@/lib/companySettings";

interface CheckoutCustomerFormProps {
  value: CheckoutCustomerInput;
  onChange: (value: CheckoutCustomerInput) => void;
  disabled?: boolean;
}

const fieldClass =
  "mt-1.5 w-full rounded-[12px] border border-[#d2d2d7] bg-white px-3.5 py-2.5 text-[15px] text-[#1d1d1f] outline-none transition focus:border-accent";

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-[13px] font-medium text-[#1d1d1f]">
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
      {children}
    </label>
  );
}

export const EMPTY_CHECKOUT_CUSTOMER: CheckoutCustomerInput = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  company: "",
  street: "",
  houseNumber: "",
  addressLine2: "",
  postalCode: "",
  city: "",
  country: "Deutschland",
};

export function CheckoutCustomerForm({
  value,
  onChange,
  disabled = false,
}: CheckoutCustomerFormProps) {
  function patch<K extends keyof CheckoutCustomerInput>(
    key: K,
    next: CheckoutCustomerInput[K],
  ) {
    onChange({ ...value, [key]: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[20px] font-semibold text-[#1d1d1f]">Kontaktdaten</h2>
        <p className="mt-1 text-[13px] text-[#6e6e73]">
          An diese E-Mail senden wir Bestellbestätigung und Versandinfos.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="E-Mail" required>
              <input
                type="email"
                autoComplete="email"
                className={fieldClass}
                value={value.email}
                disabled={disabled}
                onChange={(e) => patch("email", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Vorname" required>
            <input
              type="text"
              autoComplete="given-name"
              className={fieldClass}
              value={value.firstName}
              disabled={disabled}
              onChange={(e) => patch("firstName", e.target.value)}
            />
          </Field>
          <Field label="Nachname" required>
            <input
              type="text"
              autoComplete="family-name"
              className={fieldClass}
              value={value.lastName}
              disabled={disabled}
              onChange={(e) => patch("lastName", e.target.value)}
            />
          </Field>
          <Field label="Telefon (optional)">
            <input
              type="tel"
              autoComplete="tel"
              className={fieldClass}
              value={value.phone ?? ""}
              disabled={disabled}
              onChange={(e) => patch("phone", e.target.value)}
            />
          </Field>
          <Field label="Firma (optional)">
            <input
              type="text"
              autoComplete="organization"
              className={fieldClass}
              value={value.company ?? ""}
              disabled={disabled}
              onChange={(e) => patch("company", e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div>
        <h2 className="text-[20px] font-semibold text-[#1d1d1f]">Lieferadresse</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
          <Field label="Straße" required>
            <input
              type="text"
              autoComplete="address-line1"
              className={fieldClass}
              value={value.street}
              disabled={disabled}
              onChange={(e) => patch("street", e.target.value)}
            />
          </Field>
          <Field label="Nr." required>
            <input
              type="text"
              className={fieldClass}
              value={value.houseNumber}
              disabled={disabled}
              onChange={(e) => patch("houseNumber", e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Adresszusatz (optional)">
            <input
              type="text"
              autoComplete="address-line2"
              className={fieldClass}
              value={value.addressLine2 ?? ""}
              disabled={disabled}
              onChange={(e) => patch("addressLine2", e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
          <Field label="PLZ" required>
            <input
              type="text"
              autoComplete="postal-code"
              className={fieldClass}
              value={value.postalCode}
              disabled={disabled}
              onChange={(e) => patch("postalCode", e.target.value)}
            />
          </Field>
          <Field label="Ort" required>
            <input
              type="text"
              autoComplete="address-level2"
              className={fieldClass}
              value={value.city}
              disabled={disabled}
              onChange={(e) => patch("city", e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Land" required>
            <select
              className={fieldClass}
              value={value.country}
              disabled={disabled}
              onChange={(e) => patch("country", e.target.value)}
            >
              <option value="Deutschland">Deutschland</option>
              <option value="Österreich">Österreich</option>
              <option value="Schweiz">Schweiz</option>
            </select>
          </Field>
        </div>
      </div>
    </div>
  );
}
