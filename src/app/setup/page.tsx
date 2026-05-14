import { redirect } from "next/navigation";
import { isInitialSetupAvailable } from "@/lib/is-initial-setup-available";
import { InitialSetupForm } from "./setup-form";
import { SetupDbError } from "./setup-db-error";

/** 빌드 시 DB 조회(온보딩 가능 여부)를 하지 않도록 요청 시에만 렌더 */
export const dynamic = "force-dynamic";

/** Prisma + pg는 Node 런타임 필요 (Edge 불가) */
export const runtime = "nodejs";

export default async function SetupPage() {
  let available = false;
  let dbError: string | null = null;

  try {
    available = await isInitialSetupAvailable();
  } catch (e) {
    console.error("[setup] isInitialSetupAvailable failed:", e);
    dbError =
      e instanceof Error
        ? e.message
        : "데이터베이스에 연결할 수 없습니다.";
  }

  if (dbError) {
    return <SetupDbError message={dbError} />;
  }

  if (!available) {
    redirect("/login");
  }

  const setupSecretRequired = Boolean(process.env.SETUP_SECRET?.trim());

  return <InitialSetupForm setupSecretRequired={setupSecretRequired} />;
}
