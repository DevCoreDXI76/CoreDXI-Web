"use client";

import { useState } from "react";
import { FileText, Mail, MessageSquare, Send, User } from "lucide-react";
import { formatKstDate } from "@/lib/format-kst-date";
import { CONTACT_STATUS_OPTIONS, type ContactStatus } from "@/lib/contact-status";
import type { ContactRecord } from "@/lib/contact-types";
import {
  DEFAULT_REPLY_SUBJECT,
  templateKeyFromType,
  EMAIL_TEMPLATES,
} from "@/lib/contact-reply-templates";
import { ContactStatusBadge } from "./ContactStatusBadge";

type Props = {
  contact: ContactRecord;
  isUpdatingStatus: boolean;
  onStatusChange: (status: ContactStatus) => void;
  onSend: (input: {
    subject: string;
    body: string;
  }) => Promise<{ success: boolean; error?: string }>;
};

export function ContactReplyPanel({
  contact,
  isUpdatingStatus,
  onStatusChange,
  onSend,
}: Props) {
  const [replySubject, setReplySubject] = useState(DEFAULT_REPLY_SUBJECT);
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const loadTemplate = () => {
    const key = templateKeyFromType(contact.type);
    setReplyBody(EMAIL_TEMPLATES[key].replace("{name}", contact.name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) {
      alert("메일 본문 내용을 입력해 주세요.");
      return;
    }

    setIsSending(true);
    try {
      const result = await onSend({ subject: replySubject, body: replyBody });
      if (!result.success) {
        alert(result.error ?? "메일 발송에 실패했습니다.");
        return;
      }

      alert("성공적으로 발송되었습니다");
      setReplySubject(DEFAULT_REPLY_SUBJECT);
      setReplyBody("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 border-b pb-3">
          <MessageSquare className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">문의 내용 확인</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 text-sm">
          <div>
            <span className="block text-xs font-medium text-slate-400">
              글쓴이
            </span>
            <div className="mt-1 flex items-center gap-1 font-semibold text-slate-700">
              <User className="h-4 w-4 text-slate-500" />
              {contact.name}
            </div>
          </div>
          <div>
            <span className="block font-mono text-xs font-medium text-slate-400">
              고객 이메일
            </span>
            <span className="mt-1 block font-mono text-slate-700">
              {contact.email}
            </span>
          </div>
          <div className="col-span-2">
            <span className="block text-xs font-medium text-slate-400">
              문의 용도 (구분값)
            </span>
            <span className="mt-1 inline-block rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
              {contact.type}
            </span>
          </div>
        </div>

        <div>
          <span className="mb-1 block text-xs font-medium text-slate-400">
            상세 문의 내용
          </span>
          <div className="min-h-[120px] whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {contact.message}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label
              htmlFor="contact-status"
              className="mb-1 block text-xs font-medium text-slate-400"
            >
              처리 상태
            </label>
            <select
              id="contact-status"
              value={contact.status}
              disabled={isUpdatingStatus}
              onChange={(e) => onStatusChange(e.target.value as ContactStatus)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {CONTACT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <ContactStatusBadge status={contact.status} />
        </div>

        <div className="text-right text-xs text-slate-400">
          접수 일시: {formatKstDate(contact.created_at)}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              이메일 답장 작성
            </h2>
          </div>
          <button
            type="button"
            onClick={loadTemplate}
            className="flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-600 transition duration-200 hover:bg-violet-100"
          >
            <FileText className="h-3.5 w-3.5" />
            맞춤 양식 자동 불러오기
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">
            메일 제목
          </label>
          <input
            type="text"
            value={replySubject}
            onChange={(e) => setReplySubject(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500">
            메일 본문 내용
          </label>
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="우측 상단의 '맞춤 양식 자동 불러오기' 버튼을 누르거나 직접 답변 내용을 입력해 주세요."
            className="h-64 w-full resize-none rounded-lg border border-slate-200 p-3 font-sans text-sm leading-relaxed focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {isSending ? "메일 발송 중..." : "답장 이메일 발송하기"}
        </button>
      </form>
    </div>
  );
}
