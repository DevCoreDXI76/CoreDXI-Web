"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AboutContent } from "@/lib/page-content/about";
import { saveAboutContent } from "./actions";

type Props = {
  initial: AboutContent;
};

function updateListItem<T, K extends keyof T>(
  list: T[],
  index: number,
  key: K,
  value: T[K]
): T[] {
  return list.map((item, i) => (i === index ? { ...item, [key]: value } : item));
}

export function AboutContentForm({ initial }: Props) {
  const [values, setValues] = useState<AboutContent>(initial);
  const [pending, setPending] = useState(false);

  function updateField<K extends keyof AboutContent>(key: K, value: AboutContent[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    try {
      const result = await saveAboutContent(values);
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
          <Label htmlFor="about-hero-badge">뱃지 문구</Label>
          <Input
            id="about-hero-badge"
            value={values.heroBadge}
            onChange={(e) => updateField("heroBadge", e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="about-hero-title1">타이틀 1행</Label>
            <Input
              id="about-hero-title1"
              value={values.heroTitleLine1}
              onChange={(e) => updateField("heroTitleLine1", e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="about-hero-title2">타이틀 2행 (그라데이션 강조)</Label>
            <Input
              id="about-hero-title2"
              value={values.heroTitleLine2}
              onChange={(e) => updateField("heroTitleLine2", e.target.value)}
              disabled={pending}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="about-hero-subtitle">서브 문구</Label>
          <Textarea
            id="about-hero-subtitle"
            value={values.heroSubtitle}
            onChange={(e) => updateField("heroSubtitle", e.target.value)}
            rows={2}
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700">미션 섹션</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="about-mission-label">라벨</Label>
            <Input
              id="about-mission-label"
              value={values.missionLabel}
              onChange={(e) => updateField("missionLabel", e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="about-mission-title1">타이틀 1행</Label>
            <Input
              id="about-mission-title1"
              value={values.missionTitleLine1}
              onChange={(e) => updateField("missionTitleLine1", e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="about-mission-title2">타이틀 2행</Label>
            <Input
              id="about-mission-title2"
              value={values.missionTitleLine2}
              onChange={(e) => updateField("missionTitleLine2", e.target.value)}
              disabled={pending}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="about-mission-p1">첫 번째 문단</Label>
          <Textarea
            id="about-mission-p1"
            value={values.missionParagraph1}
            onChange={(e) => updateField("missionParagraph1", e.target.value)}
            rows={3}
            disabled={pending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="about-mission-p2">두 번째 문단</Label>
          <Textarea
            id="about-mission-p2"
            value={values.missionParagraph2}
            onChange={(e) => updateField("missionParagraph2", e.target.value)}
            rows={3}
            disabled={pending}
          />
        </div>

        <h3 className="text-xs font-semibold text-gray-500">
          미션 특징 카드 4개 (아이콘·순서 고정)
        </h3>
        {values.missionFeatures.map((f, i) => (
          <div key={i} className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`about-feature-title-${i}`}>카드 {i + 1} 제목</Label>
              <Input
                id={`about-feature-title-${i}`}
                value={f.title}
                onChange={(e) =>
                  updateField(
                    "missionFeatures",
                    updateListItem(values.missionFeatures, i, "title", e.target.value)
                  )
                }
                disabled={pending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`about-feature-desc-${i}`}>카드 {i + 1} 설명</Label>
              <Input
                id={`about-feature-desc-${i}`}
                value={f.desc}
                onChange={(e) =>
                  updateField(
                    "missionFeatures",
                    updateListItem(values.missionFeatures, i, "desc", e.target.value)
                  )
                }
                disabled={pending}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700">핵심 가치 섹션</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="about-values-label">라벨</Label>
            <Input
              id="about-values-label"
              value={values.valuesLabel}
              onChange={(e) => updateField("valuesLabel", e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="about-values-title">타이틀</Label>
            <Input
              id="about-values-title"
              value={values.valuesTitle}
              onChange={(e) => updateField("valuesTitle", e.target.value)}
              disabled={pending}
            />
          </div>
        </div>

        <h3 className="text-xs font-semibold text-gray-500">
          핵심 가치 카드 3개 (번호 01/02/03 고정)
        </h3>
        {values.values.map((v, i) => (
          <div key={i} className="space-y-1.5">
            <Label htmlFor={`about-value-title-${i}`}>가치 {i + 1} 제목</Label>
            <Input
              id={`about-value-title-${i}`}
              value={v.title}
              onChange={(e) =>
                updateField("values", updateListItem(values.values, i, "title", e.target.value))
              }
              disabled={pending}
              className="mb-1.5"
            />
            <Label htmlFor={`about-value-desc-${i}`}>가치 {i + 1} 설명</Label>
            <Textarea
              id={`about-value-desc-${i}`}
              value={v.desc}
              onChange={(e) =>
                updateField("values", updateListItem(values.values, i, "desc", e.target.value))
              }
              rows={2}
              disabled={pending}
            />
          </div>
        ))}
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700">신뢰 지표 (3개)</h2>
        {values.stats.map((s, i) => (
          <div key={i} className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor={`about-stat-value-${i}`}>수치 {i + 1}</Label>
              <Input
                id={`about-stat-value-${i}`}
                value={s.value}
                onChange={(e) =>
                  updateField("stats", updateListItem(values.stats, i, "value", e.target.value))
                }
                disabled={pending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`about-stat-label-${i}`}>라벨 {i + 1}</Label>
              <Input
                id={`about-stat-label-${i}`}
                value={s.label}
                onChange={(e) =>
                  updateField("stats", updateListItem(values.stats, i, "label", e.target.value))
                }
                disabled={pending}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700">하단 CTA 섹션</h2>
        <div className="space-y-1.5">
          <Label htmlFor="about-cta-title">CTA 타이틀</Label>
          <Input
            id="about-cta-title"
            value={values.ctaTitle}
            onChange={(e) => updateField("ctaTitle", e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="about-cta-desc">CTA 설명</Label>
          <Textarea
            id="about-cta-desc"
            value={values.ctaDesc}
            onChange={(e) => updateField("ctaDesc", e.target.value)}
            rows={2}
            disabled={pending}
          />
        </div>
      </div>

      <Button type="submit" disabled={pending} className="rounded-xl">
        {pending ? "저장 중…" : "저장하기"}
      </Button>
    </form>
  );
}
