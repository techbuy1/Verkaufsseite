import { BenefitIcon } from "@/components/Icons";

const productBenefits = [
  {
    id: "shipping",
    title: "Schneller Versand",
    description: "In 1–2 Werktagen bei dir.",
    icon: "shipping" as const,
  },
  {
    id: "quality",
    title: "Geprüfte Qualität",
    description: "Jedes Gerät sorgfältig geprüft.",
    icon: "quality" as const,
  },
  {
    id: "payment",
    title: "Sichere Zahlung",
    description: "Verschlüsselt und geschützt.",
    icon: "payment" as const,
  },
  {
    id: "return",
    title: "30 Tage Rückgabe",
    description: "Einfach und unkompliziert.",
    icon: "return" as const,
  },
];

export function ProductBenefits() {
  return (
    <section className="py-14 md:py-20">
      <div className="mb-8 text-center md:mb-10">
        <h2 className="text-[28px] font-bold tracking-[-0.03em] text-[#1d1d1f] md:text-[36px]">
          Warum TechBuy?
        </h2>
        <p className="mt-2 text-[16px] text-[#6e6e73]">
          Premium-Technik. Fairer Service. Einfach besser einkaufen.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {productBenefits.map((benefit) => (
          <div
            key={benefit.id}
            className="rounded-[18px] bg-white/70 px-4 py-5 text-center transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] md:px-5 md:py-6"
          >
            <div className="mb-3 flex justify-center text-[#1d1d1f]">
              <BenefitIcon icon={benefit.icon} className="h-6 w-6" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#1d1d1f] md:text-[15px]">
              {benefit.title}
            </h3>
            <p className="mt-1 text-[12px] leading-relaxed text-[#6e6e73] md:text-[13px]">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
