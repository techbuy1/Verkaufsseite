interface ProductDeliveryCardProps {
  items: string[];
}

export function ProductDeliveryCard({ items }: ProductDeliveryCardProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-[24px] border border-white/50 bg-white/30 px-6 py-7 backdrop-blur-md md:px-8 md:py-8">
      <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
        Lieferumfang
      </h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 text-[15px] text-[#1d1d1f]">
            <span className="text-[#6e6e73]">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
