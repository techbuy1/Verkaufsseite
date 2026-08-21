import Link from "next/link";
import { ChevronRightIcon } from "@/components/Icons";
import { Reveal } from "@/components/motion/Reveal";

/** Quick bridge from the (entirely trade-in focused) hero into the buy-side shop. */
export function ShopSortimentBanner() {
  return (
    <section className="border-y border-border bg-background-secondary">
      <div className="mx-auto max-w-[1280px] px-5 py-6 md:px-8 lg:px-10">
        <Reveal variant="up-soft" duration={0.6} amount={0.4}>
          <Link
            href="/store"
            className="group flex flex-col items-start justify-between gap-3 rounded-[20px] border border-border bg-surface-card px-6 py-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:border-accent/40 hover:shadow-[0_10px_28px_rgba(32,169,104,0.1)] sm:flex-row sm:items-center"
          >
            <p className="text-[16px] font-semibold text-text-primary md:text-[18px]">
              Schau dir hier unser komplettes Sortiment an.
            </p>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[980px] bg-accent px-5 py-2.5 text-[14px] font-medium text-white transition-colors group-hover:bg-accent-hover">
              Zum Store
              <ChevronRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
