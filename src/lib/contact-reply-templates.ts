export const EMAIL_TEMPLATES = {
  introduction: `안녕하세요, {name} 고객님.\n디지털 전환 파트너 CoreDXI 영업팀입니다.\n\nCoreDXI 서비스 도입 및 견적에 대해 문의해 주셔서 진심으로 감사드립니다.\n\n고객님께서 요청하신 솔루션의 대략적인 견적 및 도입 프로세스 안내 자료를 첨부해 드립니다.\n더불어 구체적인 요구사항 파악을 위해 짧은 미팅(10~15분)을 제안해 드리고자 합니다.\n\n편하신 일정을 말씀해 주시면 맞추어 연락드리겠습니다.\n\n감사합니다.\nCoreDXI 영업팀 드림.`,
  demo: `안녕하세요, {name} 고객님.\nCoreDXI 기술지원팀입니다.\n\n제품 데모 시연을 요청해 주셔서 감사합니다.\n\n요청하신 제품 데모 시연은 온라인(Zoom/Teams) 또는 오프라인 방문을 통해 진행 가능합니다.\n원활한 시연 준비를 위해 아래 양식을 작성해 답장해 주시면 감사하겠습니다.\n\n1. 희망 일시 (1지망, 2지망):\n2. 참석 인원 및 주요 관심 기능:\n\n일정이 확정되는 대로 화상회의 링크 또는 방문 안내를 다시 드리겠습니다.\n\n감사합니다.\nCoreDXI 기술지원팀 드림.`,
  technical: `안녕하세요, {name} 고객님.\nCoreDXI 엔지니어링팀입니다.\n\n기능 및 기술적인 부분에 대해 문의해 주신 내용에 대한 답변입니다.\n\n[문의 내용 관련 안내]\n- 현재 문의하신 현상은 ... 이 원인일 수 있으며, 아래와 같은 방법으로 해결이 가능합니다.\n- 조치 방법: ...\n\n만약 위 방법으로도 해결되지 않거나 추가적인 로그 분석이 필요하시다면 언제든 이 메일로 재문의 부탁드립니다. 빠르게 지원해 드리겠습니다.\n\n감사합니다.\nCoreDXI 엔지니어링팀 드림.`,
  partnership: `안녕하세요, {name} 대표님/담당자님.\nCoreDXI 전략기획팀입니다.\n\n귀사의 소중한 파트너십 및 제휴 제안에 깊은 감사를 드립니다.\n\n보내주신 제안서는 담당 부서에서 긍정적으로 검토 중에 있습니다.\n서로 시너지를 낼 수 있는 방향성에 대해 조금 더 심도 있게 논의하기 위해 대면 또는 화상 미팅을 진행하고 싶습니다.\n\n검토 결과 및 후속 일정은 이번 주 내로 다시 안내해 드리겠습니다.\n\n감사합니다.\nCoreDXI 전략기획팀 드림.`,
  general: `안녕하세요, {name} 고객님.\nCoreDXI 고객지원팀입니다.\n\n보내주신 문의 사항은 정상적으로 접수되었습니다.\n\n고객님께서 남겨주신 내용에 대해 담당 부서에서 확인 중에 있으며, 서둘러 확인하여 정확한 답변을 드릴 수 있도록 하겠습니다.\n조금만 기다려 주시면 감사하겠습니다.\n\n감사합니다.\nCoreDXI 고객지원팀 드림.`,
} as const;

export type TemplateKey = keyof typeof EMAIL_TEMPLATES;

const TYPE_TO_TEMPLATE: Record<string, TemplateKey> = {
  "서비스 도입 및 견적 문의": "introduction",
  "제품 데모 시연 요청": "demo",
  "기능 및 기술 관련 문의": "technical",
  "파트너십 및 제휴 제안": "partnership",
  기타: "general",
};

export function templateKeyFromType(type: string): TemplateKey {
  return TYPE_TO_TEMPLATE[type] ?? "general";
}

export const DEFAULT_REPLY_SUBJECT = "[CoreDXI] 문의하신 내용에 대한 답변입니다.";
