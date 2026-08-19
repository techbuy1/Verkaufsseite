"use client";

import { useState } from "react";
import Link from "next/link";
import { DEMO_CATEGORIES } from "@/data/admin/demoData";
import { heroImagePath } from "@/data/heroImageAssets";
import { AdminIcon } from "./AdminIcons";

const storageOptions = ["128 GB", "256 GB", "512 GB", "1 TB"];
const colorOptions = ["Schwarz", "Weiß", "Orange", "Blau", "Silber"];

export function ProductForm() {
  const [trackInventory, setTrackInventory] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  return (
    <div className="mx-auto max-w-[900px] space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-[14px] text-accent hover:underline">
          ← Produkte
        </Link>
      </div>

      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1d1d1f]">Neues Produkt</h1>
        <p className="mt-1 text-[14px] text-[#6e6e73]">Demo-Formular — Speicherung folgt mit Datenbank</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Demo: Produkt würde nach DB-Anbindung gespeichert.");
        }}
        className="space-y-8"
      >
        <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="mb-5 text-[17px] font-semibold">Allgemein</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Produktname" placeholder="iPhone 17 Pro" />
            <Field label="Marke" placeholder="Apple" />
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[13px] font-medium">Kategorie</label>
              <select className="field-input">
                {DEMO_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[13px] font-medium">Beschreibung</label>
              <textarea rows={4} className="field-input" placeholder="Produktbeschreibung..." />
            </div>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="mb-5 text-[17px] font-semibold">Preise</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Verkaufspreis (€)" type="number" placeholder="1099" />
            <Field label="Vergleichspreis (€)" type="number" placeholder="1199" />
            <Field label="Einkaufspreis (€)" type="number" placeholder="850" />
            <Field label="MwSt. (%)" type="number" placeholder="19" />
          </div>
        </section>

        <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="mb-5 text-[17px] font-semibold">Inventar</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU" placeholder="IP17P-256-BLK" />
            <Field label="EAN" placeholder="0194253478921" />
            <Field label="Bestand" type="number" placeholder="12" />
            <Field label="Mindestbestand" type="number" placeholder="5" />
          </div>
          <label className="mt-4 flex items-center gap-2 text-[14px]">
            <input
              type="checkbox"
              checked={trackInventory}
              onChange={(e) => setTrackInventory(e.target.checked)}
              className="accent-accent"
            />
            Bestand verfolgen
          </label>
        </section>

        <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="mb-5 text-[17px] font-semibold">Varianten</h2>
          <div className="space-y-4">
            <VariantRow storage="256 GB" color="Schwarz" sku="IP17P-256-BLK" stock={12} />
            <VariantRow storage="512 GB" color="Orange" sku="IP17P-512-ORG" stock={5} />
          </div>
          <p className="mt-3 text-[12px] text-[#6e6e73]">
            Speicher: {storageOptions.join(", ")} · Farben: {colorOptions.join(", ")}
          </p>
          <button type="button" className="mt-4 text-[14px] font-medium text-accent hover:underline">
            + Variante hinzufügen
          </button>
        </section>

        <section className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h2 className="mb-5 text-[17px] font-semibold">Produktbilder</h2>
          <div className="rounded-xl border-2 border-dashed border-[#d2d2d7]/60 bg-[#f5f5f7]/50 p-8 text-center">
            <p className="text-[14px] text-[#6e6e73]">
              Bilder auswählen — Upload-Backend folgt
            </p>
            <button
              type="button"
              onClick={() => setImages([...images, heroImagePath("iphone17ProLineup")])}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-4 py-2 text-[13px] font-medium hover:bg-[#f5f5f7]"
            >
              <AdminIcon name="plus" className="h-4 w-4" />
              Demo-Bild hinzufügen
            </button>
          </div>
          {images.length > 0 && (
            <ul className="mt-4 space-y-2 text-[13px] text-[#6e6e73]">
              {images.map((img, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-[#f5f5f7] px-3 py-2">
                  <span>{i === 0 ? "Hauptbild · " : ""}{img}</span>
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-red-600">
                    Entfernen
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-full bg-accent px-6 py-3 text-[14px] font-medium text-white hover:bg-accent-hover transition-colors"
          >
            Produkt speichern
          </button>
          <Link
            href="/admin/products"
            className="rounded-full border border-[#d2d2d7] px-6 py-3 text-[14px] font-medium hover:bg-white transition-colors"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium">{label}</label>
      <input type={type} placeholder={placeholder} className="field-input" />
    </div>
  );
}

function VariantRow({
  storage,
  color,
  sku,
  stock,
}: {
  storage: string;
  color: string;
  sku: string;
  stock: number;
}) {
  return (
    <div className="grid gap-3 rounded-xl bg-[#f5f5f7] p-4 sm:grid-cols-4">
      <input defaultValue={storage} className="field-input" placeholder="Speicher" />
      <input defaultValue={color} className="field-input" placeholder="Farbe" />
      <input defaultValue={sku} className="field-input font-mono text-[13px]" placeholder="SKU" />
      <input defaultValue={stock} type="number" className="field-input" placeholder="Bestand" />
    </div>
  );
}
