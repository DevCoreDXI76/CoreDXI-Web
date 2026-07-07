-- Supabase Security Advisor: "RLS Disabled in Public" — public._prisma_migrations
-- 이 테이블은 Prisma 마이그레이션 이력만 담고 있어 데이터 자체는 민감하지 않지만,
-- public 스키마에 있으면 PostgREST(Supabase 클라이언트 API)로 조회가 가능해진다.
-- Prisma는 직접 Postgres 연결(테이블 소유자 권한)을 사용하므로 RLS의 영향을 받지
-- 않는다 — 정책을 추가하지 않아도(=기본 전체 차단) 마이그레이션 기능은 그대로 동작한다.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
