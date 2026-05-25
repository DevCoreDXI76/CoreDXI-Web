import type { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number;
  icon: LucideIcon;
};

export function DashboardStatCard({ label, value, icon: Icon }: Props) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value.toLocaleString("ko-KR")}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#1E4E8C]/10">
          <Icon className="size-5 text-[#1E4E8C]" aria-hidden />
        </div>
      </div>
    </div>
  );
}
