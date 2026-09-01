import Link from "next/link";
import { Reveal } from "./motion/Reveal";
import { CookieSettingsButton } from "./cookies/CookieSettingsButton";

const footerLinks = {
  rechtliches: [
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "Impressum", href: "/impressum" },
    { label: "AGB", href: "/agb" },
    { label: "Widerrufsrecht", href: "/widerruf#widerrufsrecht" },
  ],
  service: [
    { label: "Kontakt", href: "/kontakt" },
    { label: "FAQ", href: "/faq" },
    { label: "Rückgabe", href: "/rueckgabe" },
    { label: "Garantie", href: "/garantie" },
  ],
  kontakt: [
    { label: "info@techbuyshop.de", href: "mailto:info@techbuyshop.de" },
    { label: "01630448214", href: "tel:+4901630448214" },
    { label: "Support-Anfrage", href: "/support" },
    { label: "Bestellstatus", href: "/bestellstatus" },
  ],
  versand: [
    { label: "Versand", href: "/versand" },
    { label: "Lieferzeiten", href: "/lieferzeiten" },
    { label: "Sendungsverfolgung", href: "/tracking" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-techbuy-black pb-6 pt-8 text-[#F5F5F3]">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
        <Reveal variant="fade" duration={0.6}>
          <div className="mb-6">
            <Link
              href="/"
              className="group relative inline-block pt-2 transition-transform duration-300 hover:scale-[1.02]"
              aria-label="TechBuy Startseite"
            >
              <span className="absolute left-0 top-0 h-[3px] w-7 rounded-full bg-accent transition-all duration-300 group-hover:w-10" />
              <span className="text-[22px] font-semibold tracking-tight text-[#F5F5F3]">TechBuy</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
          <Reveal variant="up-soft" delay={0}>
            <div>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F5F5F3]/90">
                Rechtliches
              </h3>
              <ul className="space-y-2.5">
                {footerLinks.rechtliches.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#9A9A96] transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <CookieSettingsButton className="text-left text-[13px] text-[#9A9A96] transition-colors hover:text-accent" />
                </li>
              </ul>
              <Link
                href="/widerruf"
                className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-[980px] border border-white/15 bg-white/[0.06] px-4 text-[13px] font-medium text-[#F5F5F3] transition-colors hover:border-accent/40 hover:bg-accent/15 hover:text-accent"
              >
                Widerruf erklären
              </Link>
            </div>
          </Reveal>

          <Reveal variant="up-soft" delay={0.06}>
            <div>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F5F5F3]/90">
                Service
              </h3>
              <ul className="space-y-2.5">
                {footerLinks.service.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#9A9A96] transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal variant="up-soft" delay={0.12}>
            <div>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F5F5F3]/90">
                Kontakt
              </h3>
              <ul className="space-y-2.5">
                {footerLinks.kontakt.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#9A9A96] transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal variant="up-soft" delay={0.18} className="col-span-2 md:col-span-1">
            <div>
              <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#F5F5F3]/90">
                Versand
              </h3>
              <ul className="space-y-2.5">
                {footerLinks.versand.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-[#9A9A96] transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/[0.08] pt-5 md:flex-row md:items-center md:justify-between">
          <p className="text-[12px] text-[#9A9A96]">© {year} TechBuy. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-5">
            <Link
              href="/credits"
              className="text-[13px] text-[#9A9A96] transition-colors hover:text-accent"
            >
              Credits
            </Link>
            <Link
              href="https://www.techbuy-ankauf.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 text-[13px] text-[#9A9A96] transition-colors hover:text-accent"
            >
              TechBuy Ankauf
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        <div className="mt-5 border-t border-white/[0.06] pt-4 text-center">
          <p className="text-[12px] text-[#7C7C78]">
            Webdesign &amp; Entwicklung von{" "}
            <Link
              href="https://www.tbwebdesigne.de/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#9A9A96] underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              TB Webdesign
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
