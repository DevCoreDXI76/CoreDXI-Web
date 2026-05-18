/**
 * blog-images Storage 버킷이 없으면 생성합니다.
 * 사용: .env에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 설정 후
 *   node scripts/ensure-blog-images-bucket.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = /^([A-Z_]+)="?(.*)"?$/.exec(line.trim());
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  } catch {
    /* .env optional */
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다."
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("버킷 목록 조회 실패:", listError.message);
  process.exit(1);
}

if (buckets.some((b) => b.name === "blog-images")) {
  console.log("blog-images 버킷이 이미 있습니다.");
  process.exit(0);
}

const { error: createError } = await supabase.storage.createBucket("blog-images", {
  public: true,
  fileSizeLimit: 5 * 1024 * 1024,
});

if (createError) {
  console.error("버킷 생성 실패:", createError.message);
  process.exit(1);
}

console.log("blog-images public 버킷을 생성했습니다.");
