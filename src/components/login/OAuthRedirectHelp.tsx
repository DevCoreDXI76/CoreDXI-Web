"use client";

type OAuthRedirectHelpProps = {
  redirectUris: {
    google: string;
    kakao: string;
    naver: string;
    googleAuthorizedOrigin: string;
  };
  googleClientIdHint?: string | null;
  kakaoClientIdHint?: string | null;
};

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="space-y-0.5">
      <span className="font-medium text-amber-950 dark:text-amber-100">{label}</span>
      <div className="flex items-start gap-2">
        <code className="block flex-1 break-all rounded bg-white/80 px-2 py-1 text-[11px] text-amber-950 dark:bg-black/20 dark:text-amber-100">
          {value}
        </code>
        <button
          type="button"
          className="shrink-0 rounded border border-amber-300 bg-white px-2 py-1 text-[11px] font-medium hover:bg-amber-100 dark:border-amber-700/50 dark:bg-transparent dark:hover:bg-amber-900/30"
          onClick={() => {
            void navigator.clipboard.writeText(value);
          }}
        >
          복사
        </button>
      </div>
    </li>
  );
}

export function OAuthRedirectHelp({
  redirectUris,
  googleClientIdHint,
  kakaoClientIdHint,
}: OAuthRedirectHelpProps) {
  return (
    <div className="w-full space-y-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left text-xs text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
      <p className="font-semibold text-amber-950 dark:text-amber-100">
        Google redirect_uri_mismatch / 카카오 KOE006 해결
      </p>
      <p>
        아래 URL을 OAuth 개발자 콘솔에 <strong>한 글자도 틀리지 않게</strong>{" "}
        등록하세요. (끝에 <code>/</code> 없음, 반드시{" "}
        <code>https://www.coredxi.com</code>)
      </p>
      <ul className="space-y-2">
        <CopyRow label="Google — 승인된 리디렉션 URI" value={redirectUris.google} />
        <CopyRow
          label="Google — 승인된 JavaScript 원본"
          value={redirectUris.googleAuthorizedOrigin}
        />
        <CopyRow label="카카오 — Redirect URI" value={redirectUris.kakao} />
        <CopyRow label="네이버 — Callback URL" value={redirectUris.naver} />
      </ul>
      {(googleClientIdHint || kakaoClientIdHint) && (
        <p className="text-[11px] text-amber-800 dark:text-amber-300">
          Vercel의 클라이언트 ID가 콘솔과 같은지 확인:{" "}
          {googleClientIdHint && <>Google {googleClientIdHint}</>}
          {googleClientIdHint && kakaoClientIdHint && " · "}
          {kakaoClientIdHint && <>Kakao {kakaoClientIdHint}</>}
        </p>
      )}
    </div>
  );
}
