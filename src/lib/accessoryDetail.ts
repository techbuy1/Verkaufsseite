import type { Product } from "@/data/products";
import { isGadgetProduct, isHuellenProduct, isPanzerfolieProduct } from "@/lib/storeCatalog";

export function isAccessoryCatalogProduct(product: Product): boolean {
  return product.catalogCategory === "zubehoer";
}

function isMattePanzerfolie(product: Product): boolean {
  return isPanzerfolieProduct(product) && /matt/i.test(product.name);
}

function isPrivacyPanzerfolie(product: Product): boolean {
  return isPanzerfolieProduct(product) && /privacy/i.test(product.name);
}

function isTransparentHuelle(product: Product): boolean {
  return isHuellenProduct(product) && /transparent/i.test(product.name);
}

/** Panzerfolien werden immer im 2er-Set geliefert — alle anderen Artikel als 1 Stück. */
export function getAccessoryUnitCount(product: Product): number {
  return isPanzerfolieProduct(product) ? 2 : 1;
}

export function getAccessoryShortDescription(product: Product): string {
  if (isPanzerfolieProduct(product)) {
    if (isMattePanzerfolie(product)) {
      return "Matte Displayschutzfolie mit angenehm reflexionsarmer Oberfläche für dein Smartphone.";
    }
    if (isPrivacyPanzerfolie(product)) {
      return "Displayschutzfolie mit Sichtschutz für mehr Privatsphäre unterwegs.";
    }
    return "Klare Displayschutzfolie für zuverlässigen Schutz im Alltag. Die transparente Oberfläche bewahrt die natürliche Darstellung deines Displays und schützt es vor Kratzern und alltäglichen Gebrauchsspuren.";
  }
  if (isHuellenProduct(product)) {
    if (isTransparentHuelle(product)) {
      return "Transparente Schutzhülle, die das Design deines Smartphones sichtbar lässt.";
    }
    return "Weiche weiße Silikonhülle mit schlichtem Design und angenehmem Grip.";
  }
  if (/kabel/i.test(product.slug) || /kabel/i.test(product.name)) {
    return "Robustes USB-C Ladekabel für schnelles Aufladen unterwegs.";
  }
  if (/ladeger/i.test(product.slug)) {
    return "Kompaktes Ladegerät für zu Hause und unterwegs.";
  }
  if (/powerbank/i.test(product.slug)) {
    return "Mobile Powerbank für extra Laufzeit, wenn du sie am meisten brauchst.";
  }
  if (/adapter/i.test(product.slug)) {
    return "Praktischer Adapter für dein Setup.";
  }
  return `${product.brand} ${product.name} — passendes Zubehör bei TechBuy.`;
}

/**
 * Ausführliche Produktbeschreibung für den „Produktinfo“-Bereich der PDP.
 * Jeder Absatz wird als eigener Textblock gerendert.
 */
export function getAccessoryLongDescription(product: Product): string[] {
  if (isPanzerfolieProduct(product)) {
    if (isMattePanzerfolie(product)) {
      return [
        "Die matte TechBuy Panzerfolie kombiniert Displayschutz mit einer angenehm matten Oberfläche. Reflexionen auf dem Display werden reduziert und die Oberfläche fühlt sich bei der Bedienung angenehm an. Die Folie wird passend für dein ausgewähltes Smartphone-Modell geliefert.",
        "Im Lieferumfang befinden sich zwei matte Schutzfolien.",
      ];
    }
    if (isPrivacyPanzerfolie(product)) {
      return [
        "Die TechBuy Privacy Panzerfolie verbindet Displayschutz mit zusätzlicher Privatsphäre. Der seitliche Einblick auf das Display wird erschwert, während du dein Smartphone von vorne weiterhin normal verwenden kannst. Ideal für unterwegs, öffentliche Verkehrsmittel oder andere Situationen, in denen dein Display nicht für jeden einsehbar sein soll.",
        "Die Schutzfolie wird passend für dein ausgewähltes Smartphone-Modell geliefert.",
        "Im Lieferumfang befinden sich zwei Privacy-Schutzfolien.",
      ];
    }
    return [
      "Die klare TechBuy Panzerfolie schützt das Display deines Smartphones zuverlässig vor Kratzern und alltäglichen Gebrauchsspuren, ohne die Darstellung unnötig zu verändern. Durch die passgenaue Form sitzt die Schutzfolie sauber auf dem Display und eignet sich ideal für den täglichen Gebrauch.",
      "Im Lieferumfang befinden sich zwei Schutzfolien für das von dir ausgewählte Smartphone-Modell.",
    ];
  }
  if (isHuellenProduct(product)) {
    if (isTransparentHuelle(product)) {
      return [
        "Die transparente TechBuy Hülle schützt dein Smartphone im Alltag, ohne das ursprüngliche Design des Geräts zu verdecken. Die passgenaue Form ermöglicht den einfachen Zugriff auf Tasten und Anschlüsse und sorgt für einen sicheren Sitz.",
        "Wähle einfach dein Smartphone-Modell aus und du erhältst die dazu passende Ausführung.",
      ];
    }
    return [
      "Die weiße TechBuy Silikonhülle kombiniert ein minimalistisches Design mit praktischem Schutz für den Alltag. Die angenehm griffige Oberfläche sorgt dafür, dass dein Smartphone sicher in der Hand liegt. Aussparungen für Kamera, Anschlüsse und Bedienelemente sind passend zum ausgewählten Smartphone-Modell ausgeführt.",
      "Wähle dein Smartphone im Dropdown aus und du erhältst die passende Hülle.",
    ];
  }
  return [getAccessoryShortDescription(product)];
}

/** „Vorteile“-Checkliste unterhalb der Produktbeschreibung. */
export function getAccessoryAdvantages(product: Product): string[] {
  if (isPanzerfolieProduct(product)) {
    if (isMattePanzerfolie(product)) {
      return [
        "Matte Oberfläche",
        "Reduzierte Spiegelungen",
        "Schutz vor Kratzern und Gebrauchsspuren",
        "Passend für das ausgewählte Smartphone",
        "Zwei Schutzfolien im Lieferumfang",
      ];
    }
    if (isPrivacyPanzerfolie(product)) {
      return [
        "Zusätzlicher Sichtschutz",
        "Displayschutz für den Alltag",
        "Passend für das ausgewählte Smartphone",
        "Zwei Schutzfolien im Lieferumfang",
        "Ideal für unterwegs",
      ];
    }
    return [
      "Klare Displaydarstellung",
      "Schutz vor Kratzern und Gebrauchsspuren",
      "Passend für das ausgewählte Smartphone",
      "Zwei Schutzfolien im Lieferumfang",
      "Alltagstauglicher Displayschutz",
    ];
  }
  if (isHuellenProduct(product)) {
    if (isTransparentHuelle(product)) {
      return [
        "Transparentes Design",
        "Passgenaue Form",
        "Schutz im Alltag",
        "Freier Zugang zu Tasten und Anschlüssen",
        "Für dein ausgewähltes Smartphone-Modell",
      ];
    }
    return [
      "Angenehm griffige Oberfläche",
      "Schlichtes weißes Design",
      "Passgenauer Sitz",
      "Schutz für den Alltag",
      "Für dein ausgewähltes Smartphone-Modell",
    ];
  }
  return [];
}

/**
 * Lieferumfang — nennt bei Panzerfolien ausdrücklich „2×“ (immer im Set),
 * bei Hüllen „1×“. `deviceLabel` blendet, sobald gewählt, das konkrete
 * Smartphone-Modell statt eines Platzhaltertexts ein.
 */
export function getAccessoryDeliveryItems(product: Product, deviceLabel?: string): string[] {
  const forDevice = deviceLabel ?? "das ausgewählte Smartphone-Modell";

  if (isPanzerfolieProduct(product)) {
    return [`2× Panzerfolie für ${forDevice}`];
  }
  if (isHuellenProduct(product)) {
    return [`1× Schutzhülle für ${forDevice}`];
  }
  if (/kabel/i.test(product.slug) || /kabel/i.test(product.name)) {
    return ["1× USB-C Ladekabel"];
  }
  return ["1× " + product.name];
}

export function getAccessoryDetailImageScaleClass(product: Product): string {
  if (isPanzerfolieProduct(product)) return "accessory-detail-image-scale--folie";
  if (isHuellenProduct(product)) return "accessory-detail-image-scale--case";
  if (
    isGadgetProduct(product) &&
    (/kabel|cable/.test(product.slug) || /kabel/i.test(product.name))
  ) {
    return "accessory-detail-image-scale--cable";
  }
  if (
    isGadgetProduct(product) &&
    (/ladeger|charger/.test(product.slug) || /ladeger/i.test(product.name))
  ) {
    return "accessory-detail-image-scale--charger";
  }
  return "accessory-detail-image-scale--default";
}
