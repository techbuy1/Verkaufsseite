-- TechBuy shop orders + atomic number sequences (Neon / Postgres).
-- Idempotent: safe to run more than once.

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  payment_provider TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  order_status TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_company TEXT,
  shipping_street TEXT NOT NULL,
  shipping_house_number TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_postal_code TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  upsells_json JSONB,
  subtotal NUMERIC(12, 2) NOT NULL,
  shipping_cost NUMERIC(12, 2) NOT NULL,
  discount NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  paypal_order_id TEXT UNIQUE,
  paypal_capture_id TEXT UNIQUE,
  invoice_number TEXT UNIQUE,
  invoice_access_token TEXT UNIQUE,
  invoice_created_at TIMESTAMPTZ,
  invoice_pdf_path TEXT,
  paid_amount NUMERIC(12, 2),
  paid_at TIMESTAMPTZ,
  tracking_number TEXT,
  tracking_carrier TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  confirmation_email_sent_at TIMESTAMPTZ,
  shipping_email_sent_at TIMESTAMPTZ,
  invoice_email_sent_at TIMESTAMPTZ,
  provider_customer_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders (customer_email);
