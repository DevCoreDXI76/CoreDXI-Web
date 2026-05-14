/**
 * 최초 시스템 온보딩(/setup) 노출 여부
 *
 * DB에 비밀번호가 설정된 사용자가 한 명도 없을 때만 true.
 * (이후 동일한 이메일로 관리자 등록만 한 경우도 온보딩으로 비밀번호를 넣을 수 있음)
 */

import { prisma } from "@/lib/prisma";

export async function isInitialSetupAvailable(): Promise<boolean> {
  const withPassword = await prisma.user.count({
    where: { password: { not: null } },
  });
  return withPassword === 0;
}
