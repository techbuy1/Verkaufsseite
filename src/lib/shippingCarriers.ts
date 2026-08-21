import type { ShippingCarrier } from "@/lib/companySettings";

/** Central tracking URL builder — keep carrier URLs in one place. */
export function getTrackingUrl(
  carrier: ShippingCarrier | string,
  trackingNumber: string,
): string | null {
  const number = trackingNumber.trim();
  if (!number) return null;

  const encoded = encodeURIComponent(number);

  switch (carrier) {
    case "DHL":
      return `https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode=${encoded}`;
    case "DPD":
      return `https://tracking.dpd.de/status/de_DE/parcel/${encoded}`;
    case "Hermes":
      return `https://www.myhermes.de/empfangen/sendungsverfolgung/sendungfolgen/?trackingNumber=${encoded}`;
    case "GLS":
      return `https://gls-group.com/DE/de/paketverfolgung?match=${encoded}`;
    case "UPS":
      return `https://www.ups.com/track?loc=de_DE&tracknum=${encoded}`;
    case "Andere":
    default:
      return null;
  }
}

export function isShippingCarrier(value: string): value is ShippingCarrier {
  return ["DHL", "DPD", "Hermes", "GLS", "UPS", "Andere"].includes(value);
}
