"use client";

import {
  Check,
  Clock,
  Mail,
  MessageCircle,
  Send,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const USE_CASE_OPTIONS = [
  { value: "product", label: "제품 도입 문의" },
  { value: "partnership", label: "파트너십 · 협업" },
  { value: "media", label: "미디어 · 제휴" },
  { value: "other", label: "기타" },
] as const;

const MARKETING_POINTS = [
  "영업일 기준 1~2일 내 담당자가 연락드립니다.",
  "AX·AI 도입 로드맵과 맞춤 데모를 안내해 드립니다.",
  "PoC·파일럿 프로젝트 설계까지 함께합니다.",
  "엔터프라이즈 보안·컴플라이언스 요건을 반영합니다.",
];

function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  function handleSend() {
    if (!chatInput.trim()) return;
    setChatInput("");
  }

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-24 right-6 z-50 w-[min(100vw-3rem,360px)]">
          <div className="flex h-[420px] flex-col overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 bg-blue-600 px-4 py-3 text-white">
              <span className="font-semibold">CoreDXI 챗봇</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-white hover:bg-white/20 hover:text-white"
                aria-label="챗봇 닫기"
                onClick={() => setIsOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
              <div className="max-w-[85%] rounded-xl rounded-tl-sm bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                안녕하세요! CoreDXI AI 챗봇입니다. 무엇을 도와드릴까요?
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-slate-100 p-3">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="메시지를 입력하세요"
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"
                aria-label="메시지 전송"
                onClick={handleSend}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Button
        type="button"
        size="icon"
        className="fixed bottom-6 right-6 z-50 size-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
        aria-label={isOpen ? "챗봇 닫기" : "챗봇 열기"}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MessageCircle className="size-6" />
      </Button>
    </>
  );
}

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [useCase, setUseCase] = useState<string>("");
  const [message, setMessage] = useState("");

  const selectedUseCaseLabel = useMemo(
    () => USE_CASE_OPTIONS.find((o) => o.value === useCase)?.label,
    [useCase]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert("문의가 성공적으로 접수되었습니다. 곧 연락드리겠습니다.");
    setFirstName("");
    setLastName("");
    setEmail("");
    setUseCase("");
    setMessage("");
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 pt-24 pb-24">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
            <section className="rounded-xl bg-white p-8 shadow-lg">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                이야기 나눠봐요
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
                CoreDXI 도입·상담이 필요하시면 아래 양식을 작성해 주세요. 담당
                영업팀이 빠르게 연락드리겠습니다.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="first-name">이름 (First Name)</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="길동"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last-name">성 (Last Name)</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="홍"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">업무용 이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="use-case">
                    CoreDXI를 어떻게 사용하실 계획이신가요?
                  </Label>
                  <Select
                    value={useCase}
                    onValueChange={(v) => {
                      if (v) setUseCase(v);
                    }}
                  >
                    <SelectTrigger id="use-case" className="w-full bg-white">
                      <SelectValue placeholder="선택해 주세요">
                        {selectedUseCaseLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {USE_CASE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="message">어떻게 도와드릴까요?</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="프로젝트 배경, 일정, 예산 범위 등을 자유롭게 적어 주세요."
                    rows={4}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-2 h-11 w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  제출하기
                </Button>
              </form>
            </section>

            <section className="md:pt-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                영업팀과 상담하세요
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                CoreDXI는 B2B AX·AI 전환을 위한 회의·협업 솔루션입니다. 도입
                목적에 맞는 기능 구성과 PoC 설계까지 전문 컨설턴트가
                안내합니다.
              </p>

              <ul className="mt-8 space-y-4">
                {MARKETING_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Check className="size-4" aria-hidden="true" />
                    </span>
                    <span className="text-sm leading-relaxed text-slate-700 md:text-base">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 space-y-3 rounded-xl border border-slate-200 bg-white/60 p-5">
                <p className="flex items-center gap-2 text-sm text-slate-700">
                  <Mail className="size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>
                    <span className="font-medium">이메일</span>{" "}
                    contact@coredxi.com
                  </span>
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-700">
                  <Clock className="size-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>
                    <span className="font-medium">응답 시간</span> 영업일 기준
                    1~2일
                  </span>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <FloatingChatbot />
    </>
  );
}
