# 일반 회원 로그인 Rate Limiting 설계

## 배경

`docs/TODO.md`의 알려진 이슈: 관리자 로그인(`admin-credentials`)에는 rate limiting이 적용되어 있으나(`admin-login:{email}` 키, 15분 5회), 일반 회원 로그인(`user-credentials`)에는 없다. 공격자가 회원 이메일 하나를 정해두고 비밀번호를 무제한 대입 시도할 수 있는 상태다.

## 목표

`user-credentials` provider(`src/auth.ts`)에 이메일 기준 + IP 기준 이중 rate limiting을 추가한다. 기존 `checkRateLimit()`(`src/lib/rate-limit.ts`)과 `getClientIp()`(`src/lib/client-ip.ts`)를 그대로 재사용하며, 새 인프라를 도입하지 않는다.

## 비목표

- `admin-credentials`의 기존 동작(매 시도마다 카운트, 성공 포함)은 변경하지 않는다.
- OTP 무효화 로직, CSP 등 TODO.md의 다른 항목은 이 스펙 범위 밖이다.

## 메커니즘

`user-credentials`의 `authorize()` 콜백 시작 부분, DB에서 회원을 조회하기 전에 다음을 수행한다:

1. `getClientIp()`로 클라이언트 IP를 구한다.
2. 이메일 기준 검사: `checkRateLimit(`user-login:${normalizedEmail}`, { max: 5, windowMs: 15 * 60 * 1000 })`
3. IP 기준 검사: `checkRateLimit(`user-login-ip:${clientIp}`, { max: 20, windowMs: 15 * 60 * 1000 })`
4. 둘 중 하나라도 `allowed: false`이면 `authorize()`는 `null`을 반환한다 (DB 조회·bcrypt 비교 생략).

두 카운터는 독립적이며 이메일 기준(계정 하나를 노리는 공격 방어)과 IP 기준(여러 계정을 도는 credential stuffing 방어)을 동시에 방어한다.

## 성공 시도는 카운트하지 않음 (admin 패턴과의 차이)

기존 `admin-credentials`는 `checkRateLimit()`을 무조건 먼저 호출하기 때문에 로그인 성공 여부와 무관하게 매 시도가 카운트된다. 회원 로그인은 관리자보다 트래픽이 많고 여러 기기/탭에서의 정상적인 반복 로그인이 흔하므로, **비밀번호 검증에 실패한 시도만 카운트**하도록 개선한다.

구현 방식: rate limit 검사는 먼저 수행하되(차단 여부 판단용으로 카운트를 미리 소비하지 않고), 검사만 하고 실제 "히트 기록"은 인증 실패가 확정된 시점에 한다. 이를 위해 `checkRateLimit()`에 카운트 여부를 검사만 하는 모드가 필요하다 — 기존 함수는 "검사 + 기록"이 하나로 합쳐져 있으므로, 다음 중 하나로 분리한다:

- **채택안**: `checkRateLimit()`에 세 번째 옵션 `{ recordOnAllowed?: boolean }` (기본 `true`, 기존 호출부는 그대로 동작)을 추가한다. `user-credentials`에서는 `recordOnAllowed: false`로 호출해 "판정만" 하고, `authorize()` 마지막에 비밀번호 검증이 실패로 끝난 경우에만 별도 `recordRateLimitHit(key)` 헬퍼로 히트를 기록한다.
- 기존 `admin-credentials`, `contact-form` 호출부는 옵션을 넘기지 않으므로 동작 변화 없음.

## 에러 노출

`authorize()`가 `null`을 반환하면 기존 `UserCredentialsLoginForm.tsx`가 이미 처리 중인 공통 에러 토스트("이메일 또는 비밀번호가 올바르지 않습니다")가 그대로 뜬다. rate limit으로 막힌 것인지 비밀번호가 틀린 것인지 클라이언트에 구분해서 노출하지 않는다 — 계정 존재 여부·차단 상태를 공격자에게 알려주지 않기 위한 의도적 설계이며 admin 로그인과 동일한 원칙이다.

## 테스트

`src/lib/rate-limit.ts`(또는 새로 분리되는 헬퍼)에 대한 유닛 테스트를 기존 `src/lib/rate-limit.test.ts` 패턴으로 추가:

- 이메일 기준 5회 초과 시 6번째 시도가 차단되는지
- IP 기준 20회 초과 시 차단되는지
- 로그인 성공 시도는 카운트에 반영되지 않는지 (동일 이메일로 6번 연속 성공해도 막히지 않음)
- 실패만 반복될 때는 5회 만에 차단되는지

`src/auth.ts`는 NextAuth 설정 파일이라 직접 유닛 테스트하기 어려우므로, rate limit 판정/기록 로직은 `src/lib/rate-limit.ts` 쪽 순수 함수로 유지하고 그 함수를 테스트한다. `authorize()` 콜백 자체는 기존 관례상 별도 테스트하지 않는다(기존 admin-credentials도 미테스트).

## 영향 범위

- `src/lib/rate-limit.ts` — `recordOnAllowed` 옵션 추가 (하위 호환)
- `src/auth.ts` — `user-credentials` provider에 rate limit 검사 + 실패 시 기록 로직 추가
- 신규 테스트 파일 또는 `src/lib/rate-limit.test.ts` 확장
- DB 마이그레이션 불필요 (기존 `RateLimitHit` 테이블 그대로 사용, 키 prefix만 다름)
