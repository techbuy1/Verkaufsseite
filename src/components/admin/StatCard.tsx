interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: "default" | "success" | "warning" | "danger";
}

const accentStyles = {
  default: "text-text-primary",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-red-600",
};

export function StatCard({ label, value, hint, accent = "default" }: StatCardProps) {
  return (
    <div className="admin-stat-card">
      <p className="admin-stat-label">{label}</p>
      <p className={`admin-stat-value ${accentStyles[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-[12px] text-text-secondary">{hint}</p>}
    </div>
  );
}
