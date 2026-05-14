import { redirect } from "next/navigation";
import { isInitialSetupAvailable } from "@/lib/is-initial-setup-available";
import { InitialSetupForm } from "./setup-form";

/** 빌드 시 DB 조회(온보딩 가능 여부)를 하지 않도록 요청 시에만 렌더 */
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  if (!(await isInitialSetupAvailable())) {
    redirect("/login");
  }

  const setupSecretRequired = Boolean(process.env.SETUP_SECRET?.trim());

  return <InitialSetupForm setupSecretRequired={setupSecretRequired} />;
}
