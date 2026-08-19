import Image from "next/image";

interface HeroSeamlessImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
}

/** Hero-Bild ohne sichtbaren Container — skaliert natürlich auf die Hero-Fläche. */
export function HeroSeamlessImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: HeroSeamlessImageProps) {
  return (
    <div className="flex w-full items-center justify-center">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        placeholder="empty"
        className="shop-image-seamless h-auto max-h-[min(420px,46vw)] w-full object-contain object-center sm:max-h-[min(400px,40vw)] md:max-h-[420px]"
      />
    </div>
  );
}
