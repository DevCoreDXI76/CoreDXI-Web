import {
  CONTACT_STATUS_BADGE,
  getContactStatusLabel,
  normalizeContactStatus,
} from "@/lib/contact-status";

export function ContactStatusBadge({ status }: { status: string }) {
  const normalized = normalizeContactStatus(status);
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CONTACT_STATUS_BADGE[normalized]}`}
    >
      {getContactStatusLabel(normalized)}
    </span>
  );
}
