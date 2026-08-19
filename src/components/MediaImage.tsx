import Image from "next/image";

interface MediaImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  frameClassName?: string;
  priority?: boolean;
  sizes?: string;
}

export function MediaImage({
  src,
  alt,
  className = "object-contain",
  containerClassName = "",
  frameClassName = "shop-media-frame",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 900px",
}: MediaImageProps) {
  return (
    <div className={`${frameClassName} ${containerClassName}`.trim()}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        placeholder="empty"
        className={`shop-image-seamless ${className} transition-transform duration-500 ease-out group-hover:scale-[1.02]`}
      />
    </div>
  );
}
