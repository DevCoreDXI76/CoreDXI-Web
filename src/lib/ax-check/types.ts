import type { AxCheckAnswers, AxCheckPriority } from "./summarize";

export type { AxCheckAnswers, AxCheckPriority };

export type LeadGrade = "HOT" | "WARM" | "COLD";
export type LeadStatus = "NEW" | "CONTACTED" | "MEETING" | "CLOSED";
export type FollowupStatus = "SCHEDULED" | "HELD" | "SENDING" | "SENT" | "FAILED" | "SKIPPED";

export const LEAD_STATUS_OPTIONS = [
  { value: "NEW", label: "신규" },
  { value: "CONTACTED", label: "연락함" },
  { value: "MEETING", label: "미팅" },
  { value: "CLOSED", label: "종료" },
] as const satisfies ReadonlyArray<{ value: LeadStatus; label: string }>;

export type AxCheckFormInput = {
  refCode?: string;
  company: string;
  name: string;
  email: string;
  phone?: string;
  answers: AxCheckAnswers;
  privacyConsent: boolean;
  marketingOptIn: boolean;
};

export type AxCheckSubmitResult =
  /** t0Sent — T0(즉시 요약) 메일이 실제로 발송됐는지. 결과 화면 문구가 이 값에 따라 달라진다. */
  | {
      success: true;
      priorities: AxCheckPriority[];
      resultToken: string;
      t0Sent: boolean;
      /** Q9(안전서류 작성 시간) 월 4시간 이상 — 결과 화면 분기 블록 노출 여부. */
      safetyDocsBranch: boolean;
      /** 안전서류 도입 사례 PDF URL. 미설정이면 null(해당 CTA 숨김). */
      caseStudyUrl: string | null;
    }
  | { success: false; error: string };

/** 관리자 목록/상세용 레코드 — 이메일·전화번호 등 개인정보 포함. */
export type AxCheckLeadRecord = {
  id: string;
  refCode: string | null;
  company: string;
  name: string;
  email: string;
  phone: string | null;
  answers: AxCheckAnswers;
  catalogVersion: string;
  grade: LeadGrade;
  score: number;
  priorities: AxCheckPriority[];
  status: LeadStatus;
  note: string | null;
  marketingOptIn: boolean;
  followupStatus: FollowupStatus;
  followupScheduledAt: Date | null;
  followupSentAt: Date | null;
  followupSubject: string | null;
  followupBody: string | null;
  followupError: string | null;
  followupAttempts: number;
  t0SentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AxCheckListResult =
  | { success: true; leads: AxCheckLeadRecord[] }
  | { success: false; error: string };

export type UpdateAxCheckStatusResult =
  | { success: true }
  | { success: false; error: string };

export type UpdateAxCheckNoteResult =
  | { success: true }
  | { success: false; error: string };

export type DeleteAxCheckResult =
  | { success: true }
  | { success: false; error: string };

export type UpdateAxCheckFollowupResult =
  | { success: true }
  | { success: false; error: string };

/** /ax-check/result/[token] — 등급·이메일·전화번호 등 내부용 필드는 제외한 공개 조회 결과. */
export type AxCheckResultPageData = {
  company: string;
  priorities: AxCheckPriority[];
  safetyDocsBranch: boolean;
  caseStudyUrl: string | null;
};

export type AxCheckResultLookupResult =
  | { success: true; data: AxCheckResultPageData }
  | { success: false; error: string };
