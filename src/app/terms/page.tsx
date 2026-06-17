import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "이용약관 — CoreDXI",
  description: "CoreDXI 서비스 이용약관입니다.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-16">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            이용약관
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            최종 수정일: 2026년 6월 1일 · 시행일: 2026년 6월 1일
          </p>

          <div className="mt-10 space-y-10 text-sm leading-relaxed text-foreground/80">
            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">
                제1조 (목적)
              </h2>
              <p>
                이 약관은 CoreDXI(이하 &quot;회사&quot;)가 제공하는 AI 기반 AX 전환
                솔루션 및 관련 서비스(이하 &quot;서비스&quot;)의 이용 조건과 절차,
                회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로
                합니다.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">
                제2조 (정의)
              </h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  &quot;서비스&quot;란 회사가 제공하는 AI 협업 자동화, AX 전환 컨설팅,
                  엔터프라이즈 AI 플랫폼 및 이와 관련된 일체의 서비스를
                  의미합니다.
                </li>
                <li>
                  &quot;이용자&quot;란 이 약관에 동의하고 서비스를 이용하는 개인 또는
                  법인을 의미합니다.
                </li>
                <li>
                  &quot;계정&quot;이란 이용자가 서비스를 이용하기 위해 생성한 아이디와
                  비밀번호의 조합을 의미합니다.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">
                제3조 (약관의 효력과 변경)
              </h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  이 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.
                </li>
                <li>
                  회사는 관련 법령에 위배되지 않는 범위에서 이 약관을 변경할
                  수 있으며, 변경 시 적용 일자와 변경 사유를 명시하여 최소
                  7일 전에 공지합니다.
                </li>
                <li>
                  이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을
                  중단하고 탈퇴할 수 있습니다.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">
                제4조 (서비스 이용 계약)
              </h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  서비스 이용 계약은 이용자가 회원가입 절차를 완료하거나, 서비스
                  도입 계약에 서명함으로써 성립됩니다.
                </li>
                <li>
                  만 14세 미만의 아동은 회원가입 및 서비스 이용이 제한될 수
                  있습니다.
                </li>
                <li>
                  회사는 다음 각 호에 해당하는 경우 이용 신청을 거부하거나
                  사후에 이용 계약을 해지할 수 있습니다.
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>타인의 명의를 사용한 경우</li>
                    <li>허위 정보를 기재한 경우</li>
                    <li>관련 법령에 위반되는 목적으로 신청한 경우</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">
                제5조 (이용자의 의무)
              </h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>이용자는 계정 정보를 안전하게 관리할 책임이 있습니다.</li>
                <li>
                  이용자는 다음 행위를 하여서는 안 됩니다.
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    <li>타인의 개인정보를 무단으로 수집·이용하는 행위</li>
                    <li>서비스의 정상적인 운영을 방해하는 행위</li>
                    <li>서비스를 통해 얻은 정보를 무단으로 복제·배포·판매하는 행위</li>
                    <li>관련 법령 또는 이 약관을 위반하는 행위</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">
                제6조 (서비스의 제공 및 변경)
              </h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  회사는 연중무휴 24시간 서비스를 제공하는 것을 원칙으로
                  합니다. 단, 시스템 점검 등 부득이한 경우 사전에 공지합니다.
                </li>
                <li>
                  회사는 서비스의 내용을 변경할 수 있으며, 이 경우 변경 내용과
                  적용 일자를 사전에 공지합니다.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">
                제7조 (지식재산권)
              </h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  서비스 내 콘텐츠, 소프트웨어, UI/UX 디자인 등 모든
                  지식재산권은 회사에 귀속됩니다.
                </li>
                <li>
                  이용자는 회사의 사전 서면 동의 없이 서비스의 일부 또는
                  전부를 복제·배포·수정하거나 상업적으로 이용할 수 없습니다.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">
                제8조 (면책 조항)
              </h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  회사는 천재지변, 불가항력 등 회사의 귀책 사유가 없는 사유로
                  인한 서비스 중단에 대해서는 책임을 지지 않습니다.
                </li>
                <li>
                  이용자 간 또는 이용자와 제3자 간에 발생한 분쟁에 대해 회사는
                  개입하지 않으며 이로 인한 손해를 책임지지 않습니다.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">
                제9조 (준거법 및 분쟁 해결)
              </h2>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  이 약관은 대한민국 법률에 따라 해석되고 적용됩니다.
                </li>
                <li>
                  서비스 이용과 관련하여 분쟁이 발생한 경우, 회사 소재지
                  관할 법원을 제1심 법원으로 합니다.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="mb-3 text-base font-bold text-foreground">
                제10조 (문의처)
              </h2>
              <p>
                이용약관에 관한 문의사항은 아래로 연락 주시기 바랍니다.
              </p>
              <ul className="mt-2 space-y-1 pl-4">
                <li>회사명: CoreDXI</li>
                <li>이메일: contact@coredxi.com</li>
                <li>웹사이트: www.coredxi.com</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
