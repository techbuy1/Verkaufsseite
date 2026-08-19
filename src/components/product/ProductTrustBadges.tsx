const trustItems = [
  "Kostenloser Versand",
  "30 Tage Rückgabe",
  "Sichere Zahlung",
];

export function ProductTrustBadges() {
  return (
    <ul className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
      {trustItems.map((item) => (
        <li key={item} className="flex items-center gap-2 text-[13px] text-text-secondary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          {item}
        </li>
      ))}
    </ul>
  );
}
