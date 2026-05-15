import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const BCRYPT_ROUNDS = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "유효한 이메일을 입력해 주세요." },
        { status: 400 }
      );
    }
    if (!name) {
      return NextResponse.json(
        { success: false, message: "이름을 입력해 주세요." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "비밀번호는 8자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const [existingUser, existingAdmin] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.admin.findUnique({ where: { email } }),
    ]);

    if (existingUser || existingAdmin) {
      return NextResponse.json(
        { success: false, message: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json(
      { success: false, message: "회원가입 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
