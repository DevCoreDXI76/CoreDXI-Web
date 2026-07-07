"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { HomeContent } from "@/lib/page-content/home";
import { saveHomeContent } from "./actions";

type Props = {
  initial: HomeContent;
};

export function HomeContentForm({ initial }: Props) {
  const [values, setValues] = useState<HomeContent>(initial);
  const [pending, setPending] = useState(false);

  function updateField<K extends keyof HomeContent>(key: K, value: HomeContent[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateStat(index: number, key: "value" | "label", value: string) {
    setValues((prev) => ({
      ...prev,
      stats: prev.stats.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      const result = await saveHomeContent(values);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="max-w-3xl space-y-8">
      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700">히어로 섹션</h2>

        <div className="space-y-1.5">
          <Label htmlFor="home-badge">뱃지 문구</Label>
          <Input
            id="home-badge"
            value={values.badge}
            onChange={(e) => updateField("badge", e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="home-title">메인 타이틀 (줄바꿈은 Enter로)</Label>
          <Textarea
            id="home-title"
            value={values.title}
            onChange={(e) => updateField("title", e.target.value)}
            rows={2}
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="home-subtitle">서브 타이틀</Label>
          <Textarea
            id="home-subtitle"
            value={values.subtitle}
            onChange={(e) => updateField("subtitle", e.target.value)}
            rows={2}
            disabled={pending}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="home-primary-text">주요 버튼 텍스트</Label>
            <Input
              id="home-primary-text"
              value={values.primaryCtaText}
              onChange={(e) => updateField("primaryCtaText", e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="home-primary-href">주요 버튼 링크</Label>
            <Input
              id="home-primary-href"
              value={values.primaryCtaHref}
              onChange={(e) => updateField("primaryCtaHref", e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="home-secondary-text">보조 버튼 텍스트</Label>
            <Input
              id="home-secondary-text"
              value={values.secondaryCtaText}
              onChange={(e) => updateField("secondaryCtaText", e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="home-secondary-href">보조 버튼 링크</Label>
            <Input
              id="home-secondary-href"
              value={values.secondaryCtaHref}
              onChange={(e) => updateField("secondaryCtaHref", e.target.value)}
              disabled={pending}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="home-image-src">서비스 예시 이미지 URL (비우면 플레이스홀더 표시)</Label>
          <Input
            id="home-image-src"
            value={values.imageSrc ?? ""}
            onChange={(e) => updateField("imageSrc", e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="home-image-alt">이미지 대체 텍스트</Label>
          <Input
            id="home-image-alt"
            value={values.imageAlt}
            onChange={(e) => updateField("imageAlt", e.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700">신뢰 지표 (3개)</h2>
        {values.stats.map((stat, i) => (
          <div key={i} className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`home-stat-value-${i}`}>수치 {i + 1}</Label>
              <Input
                id={`home-stat-value-${i}`}
                value={stat.value}
                onChange={(e) => updateStat(i, "value", e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`home-stat-label-${i}`}>라벨 {i + 1}</Label>
              <Input
                id={`home-stat-label-${i}`}
                value={stat.label}
                onChange={(e) => updateStat(i, "label", e.target.value)}
                disabled={pending}
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={pending} className="rounded-xl">
        {pending ? "저장 중…" : "저장하기"}
      </Button>
    </form>
  );
}
