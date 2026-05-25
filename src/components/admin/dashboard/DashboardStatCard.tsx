import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtitle?: string;
};

export function DashboardStatCard({ label, value, icon: Icon, subtitle }: Props) {
  const displayValue =
    typeof value === "number" ? value.toLocaleString("ko-KR") : value;

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{displayValue}</p>
          {subtitle ? (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1E4E8C]/10">
          <Icon className="size-5 text-[#1E4E8C]" aria-hidden />
        </div>
      </div>
    </div>
  );
}
