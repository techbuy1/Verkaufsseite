import type { CheckoutCustomerInput } from "@/lib/companySettings";

export interface CustomerValidationResult {
  ok: boolean;
  message?: string;
  customer?: CheckoutCustomerInput;
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Server + client shared validation for checkout customer / shipping data. */
export function validateCheckoutCustomer(
  raw: Partial<CheckoutCustomerInput> | null | undefined,
): CustomerValidationResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, message: "Kundendaten fehlen." };
  }

  const email = clean(raw.email).toLowerCase();
  const firstName = clean(raw.firstName);
  const lastName = clean(raw.lastName);
  const phone = clean(raw.phone);
  const company = clean(raw.company);
  const street = clean(raw.street);
  const houseNumber = clean(raw.houseNumber);
  const addressLine2 = clean(raw.addressLine2);
  const postalCode = clean(raw.postalCode);
  const city = clean(raw.city);
  const country = clean(raw.country) || "Deutschland";

  if (!email || !isValidEmail(email)) {
    return { ok: false, message: "Bitte eine gültige E-Mail-Adresse angeben." };
  }
  if (!firstName) {
    return { ok: false, message: "Vorname ist erforderlich." };
  }
  if (!lastName) {
    return { ok: false, message: "Nachname ist erforderlich." };
  }
  if (!street) {
    return { ok: false, message: "Straße ist erforderlich." };
  }
  if (!houseNumber) {
    return { ok: false, message: "Hausnummer ist erforderlich." };
  }
  if (!postalCode) {
    return { ok: false, message: "PLZ ist erforderlich." };
  }
  if (!city) {
    return { ok: false, message: "Ort ist erforderlich." };
  }
  if (!country) {
    return { ok: false, message: "Land ist erforderlich." };
  }

  return {
    ok: true,
    customer: {
      email,
      firstName,
      lastName,
      ...(phone ? { phone } : {}),
      ...(company ? { company } : {}),
      street,
      houseNumber,
      ...(addressLine2 ? { addressLine2 } : {}),
      postalCode,
      city,
      country,
    },
  };
}
