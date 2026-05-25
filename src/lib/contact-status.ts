export type ContactStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ARCHIVED";

export const CONTACT_STATUS_OPTIONS = [
  { value: "PENDING", label: "대기중" },
  { value: "IN_PROGRESS", label: "검토중" },
  { value: "COMPLETED", label: "답변완료" },
  { value: "ARCHIVED", label: "보류/스팸" },
] as const satisfies ReadonlyArray<{
  value: ContactStatus;
  label: string;
}>;

export const CONTACT_STATUS_BADGE: Record<ContactStatus, string> = {
  PENDING: "bg-orange-50 text-orange-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  COMPLETED: "bg-green-50 text-green-600",
  ARCHIVED: "bg-slate-50 text-slate-600",
};

const CONTACT_STATUS_SET = new Set<string>(
  CONTACT_STATUS_OPTIONS.map((option) => option.value)
);

export function isContactStatus(value: string): value is ContactStatus {
  return CONTACT_STATUS_SET.has(value);
}

export function normalizeContactStatus(status: string): ContactStatus {
  return isContactStatus(status) ? status : "PENDING";
}

export function getContactStatusLabel(status: ContactStatus): string {
  return (
    CONTACT_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}
