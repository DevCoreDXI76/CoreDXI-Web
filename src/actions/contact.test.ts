import { beforeEach, describe, expect, it, vi } from "vitest";

// contact.ts pulls in @/auth (which eagerly constructs Prisma/NextAuth) only
// for the admin-gated actions. Mock it out so unit tests don't need a real
// DATABASE_URL / OAuth env to exercise submitContactForm's validation logic.
vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const sendResendEmailMock = vi.fn();
vi.mock("@/lib/resend", () => ({
  sendResendEmail: (...args: unknown[]) => sendResendEmailMock(...args),
}));

type SupabaseMock = {
  from: ReturnType<typeof vi.fn>;
};

let supabaseMock: SupabaseMock | null;
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdmin: () => supabaseMock,
}));

const { submitContactForm } = await import("./contact");

function validInput() {
  return {
    firstName: "민수",
    lastName: "김",
    email: "user@example.com",
    type: "제품 문의",
    message: "안녕하세요, 문의드립니다.",
  };
}

describe("submitContactForm validation", () => {
  beforeEach(() => {
    supabaseMock = null;
  });

  it("rejects when name is blank", async () => {
    const result = await submitContactForm({
      ...validInput(),
      firstName: "",
      lastName: "",
    });
    expect(result).toEqual({ success: false, error: "이름을 입력해 주세요." });
  });

  it("rejects an invalid email", async () => {
    const result = await submitContactForm({
      ...validInput(),
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing type", async () => {
    const result = await submitContactForm({ ...validInput(), type: "  " });
    expect(result).toEqual({
      success: false,
      error: "문의 유형을 선택해 주세요.",
    });
  });

  it("rejects an empty message", async () => {
    const result = await submitContactForm({ ...validInput(), message: " " });
    expect(result).toEqual({
      success: false,
      error: "문의 내용을 입력해 주세요.",
    });
  });
});

describe("submitContactForm with Supabase unavailable", () => {
  beforeEach(() => {
    supabaseMock = null;
  });

  it("returns a config error instead of throwing", async () => {
    const result = await submitContactForm(validInput());
    expect(result).toEqual({
      success: false,
      error: "문의 저장 설정이 완료되지 않았습니다.",
    });
  });
});

describe("submitContactForm happy path", () => {
  beforeEach(() => {
    sendResendEmailMock.mockReset();
    sendResendEmailMock.mockResolvedValue({ success: true });
  });

  it("inserts the contact and notifies the configured email", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn((table: string) =>
      table === "contacts" ? { insert } : { select }
    );
    supabaseMock = { from };

    const result = await submitContactForm(validInput());

    expect(result).toEqual({ success: true });
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ name: "김 민수", status: "PENDING" })
    );
    expect(sendResendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "contact@coredxi.com" })
    );
  });

  it("surfaces an error when the insert fails", async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: "boom" } });
    supabaseMock = { from: vi.fn(() => ({ insert })) };

    const result = await submitContactForm(validInput());

    expect(result).toEqual({
      success: false,
      error: "문의 접수 중 오류가 발생했습니다.",
    });
    expect(sendResendEmailMock).not.toHaveBeenCalled();
  });
});
