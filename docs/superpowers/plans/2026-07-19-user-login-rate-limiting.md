# 일반 회원 로그인 Rate Limiting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `user-credentials`(일반 회원) NextAuth provider에 이메일 기준 + IP 기준 rate limiting을 추가해, 관리자 로그인에만 있던 무차별 대입 방어를 일반 회원 로그인에도 적용한다.

**Architecture:** 기존 `src/lib/rate-limit.ts`의 `checkRateLimit()`에 "판정만 하고 기록은 나중에" 모드(`recordOnAllowed: false`)를 추가하고, 새 헬퍼 `recordRateLimitHit()`으로 실패가 확정된 시점에만 히트를 기록한다. `src/auth.ts`의 `user-credentials` provider `authorize()`에서 이 두 함수를 이메일 키(`user-login:{email}`)와 IP 키(`user-login-ip:{ip}`)에 대해 각각 호출한다. IP는 기존 `src/lib/client-ip.ts`의 `getClientIp()`를 재사용한다.

**Tech Stack:** Next.js 15 App Router, NextAuth(Auth.js) v5 beta, Prisma 7, Vitest.

## Global Constraints

- 새 인프라·라이브러리 도입 금지 — 기존 `RateLimitHit` 테이블/`checkRateLimit`/`getClientIp`만 재사용한다.
- `admin-credentials` provider의 기존 동작(매 시도마다 카운트, 성공 포함)은 변경하지 않는다. `checkRateLimit()`의 기존 호출부(admin-login, contact-form)는 옵션을 넘기지 않으므로 동작이 그대로 유지되어야 한다.
- 이메일 키: `user-login:{email.trim().toLowerCase()}`, 15분(`15 * 60 * 1000`ms)에 5회.
- IP 키: `user-login-ip:{clientIp}`, 15분에 20회.
- `user-credentials`는 로그인 **성공** 시 카운트하지 않는다 — 실패(회원 없음 또는 비밀번호 불일치)가 확정된 시점에만 두 키 모두 기록한다.
- rate limit으로 막힌 경우와 비밀번호가 틀린 경우를 클라이언트에 구분해서 노출하지 않는다 (`authorize()`는 두 경우 모두 `null` 반환, 기존 UI의 공통 에러 토스트 그대로 사용).
- DB 마이그레이션 불필요.

---

### Task 1: `checkRateLimit`에 지연 기록 모드 추가

**Files:**
- Modify: `src/lib/rate-limit.ts` (전체 42줄)
- Test: `src/lib/rate-limit.test.ts`

**Interfaces:**
- Consumes: 없음 (기존 `prisma.rateLimitHit` 모델만 사용, 기존 코드 그대로)
- Produces:
  - `checkRateLimit(key: string, { max: number; windowMs: number; recordOnAllowed?: boolean }): Promise<RateLimitResult>` — `recordOnAllowed` 기본값 `true`(기존 동작 유지). `false`면 허용 판정이어도 히트를 기록하지 않는다.
  - `recordRateLimitHit(key: string): Promise<void>` — 무조건 히트 1건을 기록한다 (윈도우 정리나 카운트 검사 없음).
  - Task 2가 이 두 함수를 `src/auth.ts`에서 가져다 쓴다.

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/rate-limit.test.ts`의 `describe("checkRateLimit", ...)` 블록 마지막 `it(...)` 뒤, 블록이 끝나는 `});` 바로 앞에 아래 테스트를 추가한다:

```ts
  it("does not record a hit when allowed but recordOnAllowed is false", async () => {
    count.mockResolvedValue(2);

    const result = await checkRateLimit("test-key", {
      max: 5,
      windowMs: 60_000,
      recordOnAllowed: false,
    });

    expect(result).toEqual({ allowed: true });
    expect(create).not.toHaveBeenCalled();
  });
```

그리고 파일 맨 끝(`describe("checkRateLimit", ...)` 블록이 닫힌 뒤)에 새 블록을 추가한다:

```ts

describe("recordRateLimitHit", () => {
  beforeEach(() => {
    create.mockReset().mockResolvedValue({});
  });

  it("records a hit for the given key", async () => {
    await recordRateLimitHit("test-key");

    expect(create).toHaveBeenCalledWith({ data: { key: "test-key" } });
  });
});
```

마지막으로 파일 상단의 import를 갱신한다. 기존:

```ts
const { checkRateLimit } = await import("./rate-limit");
```

변경 후:

```ts
const { checkRateLimit, recordRateLimitHit } = await import("./rate-limit");
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npm run test -- rate-limit`
Expected: FAIL — `recordRateLimitHit`가 아직 export되지 않았거나(`is not a function`), `recordOnAllowed` 옵션을 무시하고 `create`가 호출되어 새 테스트가 깨짐.

- [ ] **Step 3: `src/lib/rate-limit.ts`에 최소 구현 작성**

`src/lib/rate-limit.ts` 전체를 아래로 교체한다:

```ts
import { prisma } from "@/lib/prisma";

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/**
 * DB(Prisma) 기반 슬라이딩 윈도우 rate limit. Vercel 서버리스 환경에서
 * 인스턴스 간 공유되는 상태가 필요해 인메모리 대신 RateLimitHit 테이블을 사용한다.
 */
export async function checkRateLimit(
  key: string,
  {
    max,
    windowMs,
    recordOnAllowed = true,
  }: { max: number; windowMs: number; recordOnAllowed?: boolean }
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - windowMs);

  await prisma.rateLimitHit.deleteMany({
    where: { key, createdAt: { lt: windowStart } },
  });

  const count = await prisma.rateLimitHit.count({
    where: { key, createdAt: { gte: windowStart } },
  });

  if (count >= max) {
    const oldestInWindow = await prisma.rateLimitHit.findFirst({
      where: { key, createdAt: { gte: windowStart } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const retryAfterMs = oldestInWindow
      ? oldestInWindow.createdAt.getTime() + windowMs - Date.now()
      : windowMs;
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  if (recordOnAllowed) {
    await prisma.rateLimitHit.create({ data: { key } });
  }
  return { allowed: true };
}

/**
 * 판정은 checkRateLimit(recordOnAllowed: false)로 미리 해두고, 실패가
 * 확정된 시점에만 히트를 기록하고 싶을 때 쓴다 (예: 로그인 성공 시도는
 * 카운트에서 빼고 실패 시도만 카운트하는 경우).
 */
export async function recordRateLimitHit(key: string): Promise<void> {
  await prisma.rateLimitHit.create({ data: { key } });
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test -- rate-limit`
Expected: PASS — `checkRateLimit`, `recordRateLimitHit` 관련 테스트 전부 통과 (기존 3개 + 신규 2개 = 5개).

- [ ] **Step 5: 커밋**

```bash
git add src/lib/rate-limit.ts src/lib/rate-limit.test.ts
git commit -m "feat: checkRateLimit에 지연 기록 모드(recordOnAllowed) 추가"
```

---

### Task 2: `user-credentials` provider에 이메일+IP rate limiting 적용

**Files:**
- Modify: `src/auth.ts:1-21` (import 구역), `src/auth.ts:31-59` (`user-credentials` provider)

**Interfaces:**
- Consumes: Task 1의 `checkRateLimit(key, { max, windowMs, recordOnAllowed })`, `recordRateLimitHit(key)` — 정확한 시그니처는 Task 1 참고. `src/lib/client-ip.ts`의 `getClientIp(): Promise<string>` (기존 함수, 변경 없음).
- Produces: 없음 (최종 사용처 — 이 provider를 가져다 쓰는 다른 태스크 없음).

- [ ] **Step 1: import 구역 수정**

`src/auth.ts` 상단의 아래 두 줄을 찾는다:

```ts
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
```

다음으로 교체한다:

```ts
import { prisma } from "@/lib/prisma";
import { checkRateLimit, recordRateLimitHit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/client-ip";
```

- [ ] **Step 2: `user-credentials`의 `authorize()` 수정**

`src/auth.ts`에서 `id: "user-credentials"` 블록 안의 아래 코드를 찾는다:

```ts
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password || typeof email !== "string") return null;

        const user = await prisma.user.findUnique({
          where: { email: email.trim() },
        });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(String(password), user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          accountType: "user" as const,
        };
      },
```

다음으로 교체한다:

```ts
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password || typeof email !== "string") return null;

        const normalizedEmail = email.trim().toLowerCase();
        const clientIp = await getClientIp();
        const emailKey = `user-login:${normalizedEmail}`;
        const ipKey = `user-login-ip:${clientIp}`;
        const windowMs = 15 * 60 * 1000;

        const emailLimit = await checkRateLimit(emailKey, {
          max: 5,
          windowMs,
          recordOnAllowed: false,
        });
        if (!emailLimit.allowed) return null;

        const ipLimit = await checkRateLimit(ipKey, {
          max: 20,
          windowMs,
          recordOnAllowed: false,
        });
        if (!ipLimit.allowed) return null;

        const recordFailure = () =>
          Promise.all([
            recordRateLimitHit(emailKey),
            recordRateLimitHit(ipKey),
          ]);

        const user = await prisma.user.findUnique({
          where: { email: email.trim() },
        });
        if (!user?.password) {
          await recordFailure();
          return null;
        }

        const valid = await bcrypt.compare(String(password), user.password);
        if (!valid) {
          await recordFailure();
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          accountType: "user" as const,
        };
      },
```

- [ ] **Step 3: 정적 검증**

Run: `npm run lint`
Expected: 에러 없음 (경고 있어도 기존 baseline과 동일해야 함).

Run: `npx tsc --noEmit`
Expected: 타입 에러 없음.

- [ ] **Step 4: 회귀 테스트 실행**

Run: `npm run test`
Expected: PASS — 전체 스위트 통과 (Task 1에서 추가한 rate-limit 테스트 포함, 기존 admin/contact 관련 테스트에 영향 없음).

`src/auth.ts`는 NextAuth 설정 파일이라 기존 관례상(`admin-credentials`도 동일) `authorize()` 콜백 자체는 별도 유닛 테스트를 작성하지 않는다 — rate limit 로직 자체는 이미 Task 1에서 `src/lib/rate-limit.ts` 단위로 검증됐다.

- [ ] **Step 5: 수동 스모크 테스트**

1. `npm run dev`로 개발 서버 실행 (포트 3100).
2. 브라우저에서 `/login` 접속, 실제 존재하는 테스트 계정 이메일 + **틀린 비밀번호**로 5번 연속 제출 — 매번 "이메일 또는 비밀번호가 올바르지 않습니다" 토스트 확인.
3. 6번째 제출 — 여전히 같은 토스트만 뜨는지 확인 (에러 메시지가 달라지면 안 됨. rate limit 여부를 클라이언트에 노출하지 않는 게 의도된 설계).
4. `npx prisma studio` (또는 DB 클라이언트)로 `RateLimitHit` 테이블을 열어 `user-login:` / `user-login-ip:`로 시작하는 key가 각각 5건씩만 쌓여 있는지 확인 (6번째 시도는 차단만 되고 추가 기록은 없어야 함).
5. **같은 계정으로 올바른 비밀번호**를 6번 이상 연속 로그인해도 막히지 않는지 확인 (성공 시도는 카운트되지 않으므로).

- [ ] **Step 6: 커밋**

```bash
git add src/auth.ts
git commit -m "feat: 일반 회원 로그인에 이메일+IP rate limiting 적용"
```
