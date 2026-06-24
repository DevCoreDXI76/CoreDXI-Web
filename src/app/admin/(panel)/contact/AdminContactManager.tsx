"use client";

import type { ContactRecord } from "@/actions/contact";
import {
  updateContactNotificationEmail,
  updateContactStatus,
} from "@/actions/contact";
import { sendReplyEmail } from "@/actions/sendEmail";
import {
  CONTACT_STATUS_BADGE,
  CONTACT_STATUS_OPTIONS,
  type ContactStatus,
  getContactStatusLabel,
  normalizeContactStatus,
} from "@/lib/contact-status";
import { formatKstDate } from "@/lib/format-kst-date";
import {
  FileText,
  Mail,
  MessageSquare,
  Send,
  Settings,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";

const EMAIL_TEMPLATES = {
  introduction: `안녕하세요, {name} 고객님.\n디지털 전환 파트너 CoreDXI 영업팀입니다.\n\nCoreDXI 서비스 도입 및 견적에 대해 문의해 주셔서 진심으로 감사드립니다.\n\n고객님께서 요청하신 솔루션의 대략적인 견적 및 도입 프로세스 안내 자료를 첨부해 드립니다.\n더불어 구체적인 요구사항 파악을 위해 짧은 미팅(10~15분)을 제안해 드리고자 합니다.\n\n편하신 일정을 말씀해 주시면 맞추어 연락드리겠습니다.\n\n감사합니다.\nCoreDXI 영업팀 드림.`,
  demo: `안녕하세요, {name} 고객님.\nCoreDXI 기술지원팀입니다.\n\n제품 데모 시연을 요청해 주셔서 감사합니다.\n\n요청하신 제품 데모 시연은 온라인(Zoom/Teams) 또는 오프라인 방문을 통해 진행 가능합니다.\n원활한 시연 준비를 위해 아래 양식을 작성해 답장해 주시면 감사하겠습니다.\n\n1. 희망 일시 (1지망, 2지망):\n2. 참석 인원 및 주요 관심 기능:\n\n일정이 확정되는 대로 화상회의 링크 또는 방문 안내를 다시 드리겠습니다.\n\n감사합니다.\nCoreDXI 기술지원팀 드림.`,
  technical: `안녕하세요, {name} 고객님.\nCoreDXI 엔지니어링팀입니다.\n\n기능 및 기술적인 부분에 대해 문의해 주신 내용에 대한 답변입니다.\n\n[문의 내용 관련 안내]\n- 현재 문의하신 현상은 ... 이 원인일 수 있으며, 아래와 같은 방법으로 해결이 가능합니다.\n- 조치 방법: ...\n\n만약 위 방법으로도 해결되지 않거나 추가적인 로그 분석이 필요하시다면 언제든 이 메일로 재문의 부탁드립니다. 빠르게 지원해 드리겠습니다.\n\n감사합니다.\nCoreDXI 엔지니어링팀 드림.`,
  partnership: `안녕하세요, {name} 대표님/담당자님.\nCoreDXI 전략기획팀입니다.\n\n귀사의 소중한 파트너십 및 제휴 제안에 깊은 감사를 드립니다.\n\n보내주신 제안서는 담당 부서에서 긍정적으로 검토 중에 있습니다.\n서로 시너지를 낼 수 있는 방향성에 대해 조금 더 심도 있게 논의하기 위해 대면 또는 화상 미팅을 진행하고 싶습니다.\n\n검토 결과 및 후속 일정은 이번 주 내로 다시 안내해 드리겠습니다.\n\n감사합니다.\nCoreDXI 전략기획팀 드림.`,
  general: `안녕하세요, {name} 고객님.\nCoreDXI 고객지원팀입니다.\n\n보내주신 문의 사항은 정상적으로 접수되었습니다.\n\n고객님께서 남겨주신 내용에 대해 담당 부서에서 확인 중에 있으며, 서둘러 확인하여 정확한 답변을 드릴 수 있도록 하겠습니다.\n조금만 기다려 주시면 감사하겠습니다.\n\n감사합니다.\nCoreDXI 고객지원팀 드림.`,
} as const;

type TemplateKey = keyof typeof EMAIL_TEMPLATES;

const TYPE_TO_TEMPLATE: Record<string, TemplateKey> = {
  "서비스 도입 및 견적 문의": "introduction",
  "제품 데모 시연 요청": "demo",
  "기능 및 기술 관련 문의": "technical",
  "파트너십 및 제휴 제안": "partnership",
  기타: "general",
};

function templateKeyFromType(type: string): TemplateKey {
  return TYPE_TO_TEMPLATE[type] ?? "general";
}

const DEFAULT_REPLY_SUBJECT = "[CoreDXI] 문의하신 내용에 대한 답변입니다.";

function ContactStatusBadge({ status }: { status: string }) {
  const normalized = normalizeContactStatus(status);
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CONTACT_STATUS_BADGE[normalized]}`}
    >
      {getContactStatusLabel(normalized)}
    </span>
  );
}

type Props = {
  initialContacts: ContactRecord[];
  loadError?: string;
  initialNotificationEmail: string;
};

export function AdminContactManager({
  initialContacts,
  loadError,
  initialNotificationEmail,
}: Props) {
  const [adminEmail, setAdminEmail] = useState(initialNotificationEmail);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [contacts, setContacts] = useState(initialContacts);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialContacts[0]?.id ?? null
  );

  const selectedContact = useMemo(
    () => contacts.find((c) => c.id === selectedId) ?? null,
    [contacts, selectedId]
  );

  const templateKey = selectedContact
    ? templateKeyFromType(selectedContact.type)
    : "general";

  const [replySubject, setReplySubject] = useState(DEFAULT_REPLY_SUBJECT);
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSaveEmail = async () => {
    const trimmed = adminEmail.trim();
    if (!trimmed) {
      alert("알림 수신 메일 주소를 입력해 주세요.");
      return;
    }

    setIsSavingEmail(true);
    try {
      const result = await updateContactNotificationEmail(trimmed);
      if (!result.success) {
        alert(result.error ?? "알림 수신 메일 저장에 실패했습니다.");
        return;
      }

      setAdminEmail(result.email);
      setIsEditingEmail(false);
      alert(`문의 수신 메일 주소가 ${result.email}로 변경되었습니다.`);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const loadTemplate = (key: TemplateKey) => {
    if (!selectedContact) return;
    const formattedTemplate = EMAIL_TEMPLATES[key].replace(
      "{name}",
      selectedContact.name
    );
    setReplyBody(formattedTemplate);
  };

  const applyContactStatus = async (
    contactId: string,
    newStatus: ContactStatus,
    previousStatus: ContactStatus
  ) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === contactId ? { ...contact, status: newStatus } : contact
      )
    );

    const result = await updateContactStatus(contactId, newStatus);
    if (!result.success) {
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === contactId
            ? { ...contact, status: previousStatus }
            : contact
        )
      );
      alert(result.error ?? "상태 변경에 실패했습니다.");
      return false;
    }

    return true;
  };

  const handleStatusChange = async (newStatus: ContactStatus) => {
    if (!selectedContact || selectedContact.status === newStatus) return;

    setIsUpdatingStatus(true);
    try {
      await applyContactStatus(
        selectedContact.id,
        newStatus,
        selectedContact.status
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContact) {
      alert("답장할 문의를 선택해 주세요.");
      return;
    }
    if (!replyBody.trim()) {
      alert("메일 본문 내용을 입력해 주세요.");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendReplyEmail({
        to: selectedContact.email,
        subject: replySubject,
        text: replyBody,
      });

      if (!result.success) {
        alert(result.error ?? "메일 발송에 실패했습니다.");
        return;
      }

      const previousStatus = selectedContact.status;
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedContact.id
            ? { ...contact, status: "COMPLETED" }
            : contact
        )
      );

      const statusResult = await updateContactStatus(
        selectedContact.id,
        "COMPLETED"
      );
      if (!statusResult.success) {
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === selectedContact.id
              ? { ...contact, status: previousStatus }
              : contact
          )
        );
        alert(
          `메일은 발송되었으나 상태 변경에 실패했습니다. ${statusResult.error ?? ""}`.trim()
        );
      }

      alert("성공적으로 발송되었습니다");
      setReplySubject(DEFAULT_REPLY_SUBJECT);
      setReplyBody("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-slate-800">
      {loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            고객 문의 및 답장 관리
          </h1>
          <p className="text-sm text-slate-500">
            방문자의 문의를 확인하고 정석 양식으로 신속하게 메일 답장을
            보냅니다.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
          <Settings className="h-4 w-4 text-slate-500" />
          <span className="min-w-[90px] text-xs font-semibold text-slate-600">
            알림 수신 메일:
          </span>
          {isEditingEmail ? (
            <div className="flex items-center gap-1">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-44 rounded border bg-white p-1 text-xs focus:outline-indigo-500"
              />
              <button
                type="button"
                onClick={handleSaveEmail}
                disabled={isSavingEmail}
                className="rounded bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingEmail ? "저장 중..." : "저장"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-700">
                {adminEmail}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingEmail(true)}
                className="text-xs text-indigo-600 hover:underline"
              >
                변경
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">접수된 문의 목록</h2>
        </div>
        {contacts.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            접수된 문의가 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">접수일</th>
                  <th className="px-4 py-3">이름</th>
                  <th className="px-4 py-3">이메일</th>
                  <th className="px-4 py-3">유형</th>
                  <th className="px-4 py-3">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((contact) => {
                  const isSelected = contact.id === selectedId;
                  return (
                    <tr
                      key={contact.id}
                      onClick={() => setSelectedId(contact.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-indigo-50/80"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="px-4 py-3 text-slate-600">
                        {formatKstDate(contact.created_at)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {contact.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {contact.email}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{contact.type}</td>
                      <td className="px-4 py-3">
                        <ContactStatusBadge status={contact.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedContact ? (
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
                  {selectedContact.name}
                </div>
              </div>
              <div>
                <span className="block font-mono text-xs font-medium text-slate-400">
                  고객 이메일
                </span>
                <span className="mt-1 block font-mono text-slate-700">
                  {selectedContact.email}
                </span>
              </div>
              <div className="col-span-2">
                <span className="block text-xs font-medium text-slate-400">
                  문의 용도 (구분값)
                </span>
                <span className="mt-1 inline-block rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                  {selectedContact.type}
                </span>
              </div>
            </div>

            <div>
              <span className="mb-1 block text-xs font-medium text-slate-400">
                상세 문의 내용
              </span>
              <div className="min-h-[120px] whitespace-pre-wrap rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                {selectedContact.message}
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
                  value={selectedContact.status}
                  disabled={isUpdatingStatus}
                  onChange={(e) =>
                    void handleStatusChange(e.target.value as ContactStatus)
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {CONTACT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <ContactStatusBadge status={selectedContact.status} />
            </div>

            <div className="text-right text-xs text-slate-400">
              접수 일시: {formatKstDate(selectedContact.created_at)}
            </div>
          </div>

          <form
            onSubmit={handleSendEmail}
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
                onClick={() => loadTemplate(templateKey)}
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
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
          목록에서 문의를 선택하면 상세 내용과 답장 폼이 표시됩니다.
        </div>
      )}
    </div>
  );
}
