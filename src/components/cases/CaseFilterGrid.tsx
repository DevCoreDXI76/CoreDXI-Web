"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INDUSTRY_OPTIONS,
  SOLUTION_TYPE_OPTIONS,
} from "@/lib/portfolio-taxonomy";
import type { PortfolioPublic } from "@/lib/portfolio";
import { CaseCard } from "./CaseCard";

const ALL = "__all__";

type Props = {
  initialItems: PortfolioPublic[];
};

export function CaseFilterGrid({ initialItems }: Props) {
  const [industry, setIndustry] = useState(ALL);
  const [solutionType, setSolutionType] = useState(ALL);
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);

  const hasFilter = industry !== ALL || solutionType !== ALL;

  useEffect(() => {
    if (!hasFilter) {
      setItems(initialItems);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams();
    if (industry !== ALL) params.set("industry", industry);
    if (solutionType !== ALL) params.set("solutionType", solutionType);

    fetch(`/api/cases/search?${params.toString()}`)
      .then((res) => res.json())
      .then((data: { items: PortfolioPublic[] }) => {
        if (!cancelled) setItems(data.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industry, solutionType]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Select value={industry} onValueChange={(v) => v && setIndustry(v)}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue placeholder="업종" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>전체 업종</SelectItem>
            {INDUSTRY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={solutionType}
          onValueChange={(v) => v && setSolutionType(v)}
        >
          <SelectTrigger className="w-52 bg-card">
            <SelectValue placeholder="솔루션 유형" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>전체 솔루션 유형</SelectItem>
            {SOLUTION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
          불러오는 중…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-muted-foreground">
          조건에 맞는 성공사례가 없습니다.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
