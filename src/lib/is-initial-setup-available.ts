/**
 * 최초 시스템 온보딩(/setup) 노출 여부
 *
 * Admin 테이블에 비밀번호가 설정된 관리자가 한 명도 없을 때만 true.
 */

import { prisma } from "@/lib/prisma";

export async function isInitialSetupAvailable(): Promise<boolean> {
  const count = await prisma.admin.count();
  return count === 0;
}
