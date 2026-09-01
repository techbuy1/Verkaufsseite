import Image from "next/image";
import type { ProductImageType } from "@/data/products";
import { getCardBackImage } from "@/data/productImageMap";
import { ProductImageSwitch } from "./ProductImageSwitch";

interface ProductCardHoverImageProps {
  /** Frontbild (bereits farbaufgelöst – z. B. `selectedColor.imageSrc`). */
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  fallbackType?: ProductImageType;
  /**
   * Bild-Utility-Klassen (object-fit / Padding). Werden 1:1 auf Front UND
   * Back angewendet, damit beide exakt denselben Bildbereich belegen –
   * kein Sprung, kein Layout-Shift.
   */
  imageClassName?: string;
  /**
   * Der Hover-Wechsel Vorderseite → Zweitansicht greift automatisch, sobald
   * ein passendes Asset existiert (Smartphone-Backcover, iPad-Rückseite,
   * Hüllen-Rückseite, Folien-Schrägansicht …) – sonst bleibt das Frontbild.
   * `false` schaltet ihn für einen Kontext komplett ab.
   */
  hoverFlip?: boolean;
  /** Zur zentralen Zuordnung. */
  slug?: string;
  colorId?: string;
  colorName?: string;
  productId?: string;
}

const HOVER_TRANSITION = "transition-opacity duration-200 ease-out";

/**
 * Produktkartenbild mit Hover-Wechsel auf die Zweitansicht (Backcover /
 * Rückseite / alternative Ansicht).
 *
 * Rein CSS: Front `opacity 1`, Back `opacity 0`; beim `group-hover` (Karte)
 * kreuzblenden. `(hover: hover)`-Guard → auf Touch-Geräten kein Effekt,
 * kein „klebender" Zustand. Kein JS, kein State, keine Animationslib.
 *
 * Front und Back liegen absolut übereinander im selben Wrapper, identische
 * `fill` + `object-contain`-Regeln → gleiche Größe, Position, Perspektive.
 * `backImage.fit` gleicht modellweise leicht abweichende Gerätегrößen der
 * nachgelieferten Rückseitenbilder rein optisch aus (nur `scale`).
 *
 * Die Farbzuordnung ist strukturell korrekt: Front- und Backpfad stammen
 * aus demselben Farb-Eintrag der `PRODUCT_IMAGE_REGISTRY` bzw. demselben
 * Zubehör-Bildset.
 */
export function ProductCardHoverImage({
  src,
  alt,
  sizes,
  priority,
  fallbackType,
  imageClassName = "object-contain object-center",
  hoverFlip = true,
  slug,
  colorId,
  colorName,
  productId,
}: ProductCardHoverImageProps) {
  const backImage = hoverFlip
    ? getCardBackImage(src, { slug, colorId, colorName, productId })
    : undefined;

  return (
    <>
      <ProductImageSwitch
        src={src}
        alt={alt}
        sizes={sizes}
        priority={priority}
        fallbackType={fallbackType}
        className={
          backImage
            ? `${imageClassName} ${HOVER_TRANSITION} [@media(hover:hover)]:group-hover:opacity-0`
            : imageClassName
        }
      />
      {backImage ? (
        <Image
          key={backImage.src}
          src={backImage.src}
          alt=""
          aria-hidden
          fill
          loading="lazy"
          sizes={sizes}
          placeholder="empty"
          className={`shop-image-seamless ${imageClassName} opacity-0 ${HOVER_TRANSITION} [@media(hover:hover)]:group-hover:opacity-100`}
          style={backImage.fit !== 1 ? { transform: `scale(${backImage.fit})` } : undefined}
        />
      ) : null}
    </>
  );
}
