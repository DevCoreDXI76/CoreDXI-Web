import Link from "next/link";
import { quickActions } from "./mock-data";

export function QuickActionsGrid() {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className="mb-4 text-base font-semibold text-slate-900"
      >
        빠른 작업
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-indigo-100 hover:bg-indigo-50"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#1E4E8C]/10">
                <Icon className="size-4 text-[#1E4E8C]" aria-hidden />
              </div>
              <span className="text-sm font-medium text-slate-900">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
