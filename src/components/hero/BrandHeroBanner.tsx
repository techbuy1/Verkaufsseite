import Image from "next/image";
import Link from "next/link";
import type { BrandHeroSlide } from "@/data/brandHeroDevices";

interface BrandHeroBannerProps {
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaHref: string;
  ctaLabel: string;
  candidates: BrandHeroSlide[];
}

export function BrandHeroBanner({
  eyebrow,
  headline,
  subheadline,
  ctaHref,
  ctaLabel,
  candidates,
}: BrandHeroBannerProps) {
  const lead = candidates[0];

  return (
    <section className="relative overflow-hidden bg-[#0b0f1a] pb-10 pt-[88px] text-white md:pb-14 md:pt-[96px]">
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-8 px-6 md:grid-cols-2 md:px-10 lg:px-12">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/55">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-[-0.03em] md:text-[46px]">
            {headline}
          </h1>
          <p className="mt-4 max-w-[440px] text-[16px] leading-relaxed text-white/65 md:text-[18px]">
            {subheadline}
          </p>
          <Link
            href={ctaHref}
            className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-7 text-[15px] font-semibold text-[#0b0f1a]"
          >
            {ctaLabel}
          </Link>
        </div>
        {lead && (
          <div className="relative mx-auto aspect-square w-full max-w-[420px]">
            <Image
              src={lead.fallbackImage}
              alt={`${lead.model} – ${lead.colorName}`}
              fill
              priority
              sizes="(max-width: 768px) 80vw, 420px"
              className="object-contain"
            />
          </div>
        )}
      </div>
    </section>
  );
}
