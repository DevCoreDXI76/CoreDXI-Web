-- OAuth 토큰 필드 길이 확보 (카카오 등 긴 access_token 대비)
ALTER TABLE "Account" ALTER COLUMN "refresh_token" SET DATA TYPE TEXT;
ALTER TABLE "Account" ALTER COLUMN "access_token" SET DATA TYPE TEXT;
ALTER TABLE "Account" ALTER COLUMN "id_token" SET DATA TYPE TEXT;
