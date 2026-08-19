const TRUST_ITEMS = [
  {
    title: "Schneller Versand",
    description: "Versandbereit in 24 Stunden",
  },
  {
    title: "30 Tage Rückgabe",
    description: "Kostenlose Rücksendung",
  },
  {
    title: "Sichere Zahlung",
    description: "SSL & geprüfte Anbieter",
  },
  {
    title: "Geprüfte Qualität",
    description: "Original & Premium-Geräte",
  },
];

export function CartTrustSection() {
  return (
    <section className="mt-10 md:mt-12">
      <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f] md:text-[24px]">
        Warum bei TechBuy kaufen?
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.title}
            className="rounded-[20px] border border-border bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] md:p-5"
          >
            <p className="text-[14px] font-semibold text-text-primary">✓ {item.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
