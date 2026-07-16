import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { buildFaqJsonLd } from "@/lib/seo-jsonld";
import { CONTACT_FAQ_ITEMS } from "@/lib/contact-faq";
import { getContactNotificationEmail } from "@/actions/contact";
import { ContactPageClient } from "./ContactPageClient";

export const metadata: Metadata = pageMetadata({
  title: "문의하기",
  description:
    "CoreDXI에 도입 상담, 제품 문의, 파트너십 제안을 남겨주세요. 영업일 기준 1~2일 내에 답변드립니다.",
  path: "/contact",
});

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const notificationEmail = await getContactNotificationEmail();
  const faqJsonLd = buildFaqJsonLd(CONTACT_FAQ_ITEMS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ContactPageClient
        notificationEmail={notificationEmail}
        faqItems={CONTACT_FAQ_ITEMS}
      />
    </>
  );
}
