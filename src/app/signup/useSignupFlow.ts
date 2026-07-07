import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

export function useSignupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [sendPending, setSendPending] = useState(false);
  const [verifyPending, setVerifyPending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isEmailValid = email.includes("@") && email.includes(".");
  const isOtpComplete = otp.join("").length === 6;
  const canComplete = name.trim().length > 0 && password.length >= 8;

  useEffect(() => {
    const fromQuery = searchParams.get("email")?.trim();
    if (fromQuery && fromQuery.includes("@") && fromQuery.includes(".")) {
      setEmail(fromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (step === 3 && !emailOtpVerified) {
      setStep(2);
    }
  }, [step, emailOtpVerified]);

  async function handleSendOtp() {
    if (!isEmailValid || sendPending) return;
    setSendPending(true);
    setOtpError(null);
    try {
      const normalized = email.trim().toLowerCase();
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message ?? "인증 메일 발송에 실패했습니다.");
        return;
      }
      setEmail(normalized);
      setOtp(["", "", "", "", "", ""]);
      setEmailOtpVerified(false);
      setStep(2);
      toast.success("인증 코드를 이메일로 보냈습니다.");
    } catch {
      toast.error("인증 메일 발송 중 오류가 발생했습니다.");
    } finally {
      setSendPending(false);
    }
  }

  async function handleVerifyOtp() {
    if (!isOtpComplete || verifyPending) return;
    setVerifyPending(true);
    setOtpError(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: otp.join(""),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.message ?? "인증 코드가 올바르지 않습니다.");
        return;
      }
      setEmailOtpVerified(true);
      setStep(3);
    } catch {
      setOtpError("인증 확인 중 오류가 발생했습니다.");
    } finally {
      setVerifyPending(false);
    }
  }

  function handleOtpChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  async function handleComplete() {
    if (!canComplete || pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message ?? "회원가입에 실패했습니다.");
        return;
      }

      const signInResult = await signIn("user-credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.success("가입이 완료되었습니다. 로그인해 주세요.");
        router.push("/login");
        return;
      }

      toast.success("가입이 완료되었습니다.");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("회원가입 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  return {
    step,
    email,
    setEmail,
    otp,
    otpRefs,
    name,
    setName,
    password,
    setPassword,
    pending,
    sendPending,
    verifyPending,
    otpError,
    emailOtpVerified,
    isEmailValid,
    isOtpComplete,
    canComplete,
    handleSendOtp,
    handleVerifyOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleComplete,
  };
}
