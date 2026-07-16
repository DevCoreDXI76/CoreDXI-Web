/**
 * ContactFaqSection.tsx
 *
 * 문의하기 페이지 하단 FAQ 아코디언 섹션입니다.
 * 검색엔진 리치 결과(FAQ)와 사용자 안내를 동시에 제공합니다.
 */
import type { ContactFaqItem } from "@/lib/contact-faq";

type Props = {
  items: ContactFaqItem[];
};

export function ContactFaqSection({ items }: Props) {
  return (
    <section className="mt-16 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      {/* [홍보팀] FAQ 섹션 제목입니다. */}
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
        자주 묻는 질문
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        도입 전에 많이 받는 질문을 정리했습니다. 추가 문의는 양식으로 남겨 주세요.
      </p>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 open:bg-white"
          >
            <summary className="cursor-pointer list-none text-base font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
              {/* [홍보팀] FAQ 질문 문구입니다. */}
              {item.question}
            </summary>
            {/* [홍보팀] FAQ 답변 문구입니다. */}
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
