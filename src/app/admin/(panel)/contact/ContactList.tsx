import { formatKstDate } from "@/lib/format-kst-date";
import type { ContactRecord } from "@/lib/contact-types";
import { ContactStatusBadge } from "./ContactStatusBadge";

type Props = {
  contacts: ContactRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ContactList({ contacts, selectedId, onSelect }: Props) {
  return (
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
                    onClick={() => onSelect(contact.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-indigo-50/80" : "hover:bg-slate-50/80"
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
  );
}
