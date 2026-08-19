interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: "default" | "success" | "warning" | "danger";
}

const accentStyles = {
  default: "text-[#1d1d1f]",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-red-600",
};

export function StatCard({ label, value, hint, accent = "default" }: StatCardProps) {
  return (
    <div className="rounded-[18px] border border-[#d2d2d7]/40 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <p className="text-[12px] font-medium uppercase tracking-wider text-[#6e6e73]">
        {label}
      </p>
      <p className={`mt-2 text-[28px] font-bold tracking-tight ${accentStyles[accent]}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-[12px] text-[#6e6e73]">{hint}</p>}
    </div>
  );
}
