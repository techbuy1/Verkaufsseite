import Link from "next/link";
import type { MegaMenuColumn, NavLinkItem } from "@/data/navigation";

function NavLink({
  item,
  size = "default",
  onNavigate,
}: {
  item: NavLinkItem;
  size?: "featured" | "default" | "small";
  onNavigate?: () => void;
}) {
  const className =
    size === "featured"
      ? "block text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#1d1d1f] transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/20 focus-visible:ring-offset-2 rounded-sm"
      : size === "small"
        ? "block text-[13px] leading-relaxed text-[#6e6e73] transition-colors hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/20 focus-visible:ring-offset-2 rounded-sm"
        : "block text-[14px] leading-relaxed text-[#1d1d1f] transition-colors hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f]/20 focus-visible:ring-offset-2 rounded-sm";

  return (
    <Link href={item.href} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export function MegaMenuColumnView({
  column,
  onNavigate,
}: {
  column: MegaMenuColumn;
  onNavigate?: () => void;
}) {
  return (
    <div className="min-w-0">
      {column.eyebrow && (
        <p className="mb-5 text-[12px] font-medium uppercase tracking-[0.08em] text-[#6e6e73]">
          {column.eyebrow}
        </p>
      )}

      {column.title && (
        <p
          className={`mb-4 text-[12px] font-medium uppercase tracking-[0.08em] text-[#6e6e73] ${
            column.featured && column.featured.length > 0 ? "mt-8" : ""
          }`}
        >
          {column.title}
        </p>
      )}

      {column.featured && column.featured.length > 0 && (
        <ul className="space-y-3">
          {column.featured.map((item) => (
            <li key={`${item.href}-${item.label}`}>
              <NavLink item={item} size="featured" onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      )}

      {column.links && column.links.length > 0 && (
        <ul className={`space-y-2.5 ${column.featured ? "mt-8" : ""}`}>
          {column.links.map((item) => (
            <li key={`${item.href}-${item.label}`}>
              <NavLink item={item} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      )}

      {column.smallLinks && column.smallLinks.length > 0 && (
        <ul className="mt-8 space-y-2 border-t border-black/[0.06] pt-5">
          {column.smallLinks.map((item) => (
            <li key={`${item.href}-${item.label}`}>
              <NavLink item={item} size="small" onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
