import Link from "next/link";

interface ModelCredit {
  title: string;
  usedFor: string;
  url: string;
}

const MODEL_CREDITS: ModelCredit[] = [
  {
    title: "Samsung Galaxy S26 Ultra",
    usedFor: "Samsung Galaxy S26 Ultra — 360°-Ansicht & Hero-Banner",
    url: "https://sketchfab.com/3d-models/samsung-galaxy-s26-ultra-15023522b9e342a194454fb371163f8e",
  },
  {
    title: "Samsung Galaxy S26 Ultra (alternatives Modell)",
    usedFor: "Samsung Galaxy S26 Ultra — 360°-Ansicht & Hero-Banner",
    url: "https://sketchfab.com/3d-models/samsung-galaxy-s26-ultra-ee14d453cc8d4c12bf9e0b3279f2f7fb",
  },
  {
    title: "Google Pixel 10a",
    usedFor: "Google Pixel — Hero-Banner",
    url: "https://sketchfab.com/3d-models/google-pixel-10a-da2cfbe0418e4b97abba33e40893f276",
  },
  {
    title: "iPhone 16",
    usedFor: "iPhone 16 — 3D-Vorschau",
    url: "https://sketchfab.com/3d-models/iphone-16-teal-free-c7f900aa7ac547a487f1ba3082dac96a",
  },
  {
    title: "iPhone 17 Pro",
    usedFor: "iPhone 17 Pro — Hero-Banner",
    url: "https://sketchfab.com/3d-models/iphone-17-pro-4541aa8a28324b33a2baaf81d263aaec",
  },
];

export function CreditsPageContent() {
  return (
    <div className="mx-auto max-w-[820px] px-5 py-16 md:px-8 md:py-20">
      <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-accent">
        Credits
      </p>
      <h1 className="mb-4 text-[32px] font-bold tracking-tight text-text-primary md:text-[40px]">
        3D-Modelle &amp; Credits
      </h1>
      <p className="mb-12 max-w-[640px] text-[15px] leading-relaxed text-text-secondary md:text-[16px]">
        Die interaktiven 360°-Ansichten und 3D-Darstellungen auf TechBuy nutzen unter anderem
        Modelle von unabhängigen Creators auf{" "}
        <Link
          href="https://sketchfab.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:underline"
        >
          Sketchfab
        </Link>
        . Vielen Dank an die Ersteller für die geteilten Modelle.
      </p>

      <div className="space-y-3">
        {MODEL_CREDITS.map((credit) => (
          <Link
            key={credit.url}
            href={credit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 rounded-[16px] border border-border bg-surface-card px-5 py-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:border-accent/40 hover:shadow-[0_8px_24px_rgba(32,169,104,0.1)]"
          >
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-text-primary">{credit.title}</p>
              <p className="mt-0.5 text-[13px] text-text-secondary">{credit.usedFor}</p>
            </div>
            <span className="shrink-0 text-text-secondary transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
