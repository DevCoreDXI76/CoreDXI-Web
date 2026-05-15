import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "유효한 이메일을 입력해 주세요." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    const exists = Boolean(user);
    const hasPassword = Boolean(user?.password && user.password.length > 0);

    return NextResponse.json({ exists, hasPassword });
  } catch (e) {
    console.error("[check-email]", e);
    return NextResponse.json(
      { success: false, message: "이메일 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
