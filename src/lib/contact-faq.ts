/**
 * contact-faq.ts
 *
 * 문의하기 페이지에 표시되는 FAQ 항목과 JSON-LD용 데이터입니다.
 * [홍보팀] 질문·답변 문구를 수정할 때 이 파일을 편집하세요.
 */
export type ContactFaqItem = {
  question: string;
  answer: string;
};

export const CONTACT_FAQ_ITEMS: ContactFaqItem[] = [
  {
    question: "CoreDXI는 어떤 기업에 적합한가요?",
    answer:
      "B2B 환경에서 회의·협업 프로세스를 AI와 함께 개선하려는 중견·대기업, 공공·금융·제조 등 AX 전환을 검토하는 조직에 적합합니다.",
  },
  {
    question: "도입 상담 후 응답은 얼마나 걸리나요?",
    answer:
      "문의 접수 후 영업일 기준 1~2일 내 담당자가 이메일 또는 전화로 연락드립니다.",
  },
  {
    question: "PoC(파일럿) 프로젝트도 가능한가요?",
    answer:
      "가능합니다. 고객 환경에 맞는 PoC·파일럿 범위와 일정을 함께 설계해 드립니다.",
  },
  {
    question: "보안·컴플라이언스 요건을 반영할 수 있나요?",
    answer:
      "엔터프라이즈 보안 정책과 사내 컴플라이언스 요건을 반영한 도입 방안을 제안합니다.",
  },
];
