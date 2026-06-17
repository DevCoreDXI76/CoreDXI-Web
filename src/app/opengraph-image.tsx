import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CoreDXI — 비즈니스의 중심을 AI로 깨우다";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 장식: 오른쪽 상단 원형 글로우 */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(30,78,140,0.55) 0%, transparent 70%)",
          }}
        />
        {/* 배경 장식: 왼쪽 하단 원형 글로우 */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(30,78,140,0.35) 0%, transparent 70%)",
          }}
        />

        {/* 상단: 로고 + 태그라인 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                backgroundColor: "#1E4E8C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "3px solid white",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.5px",
              }}
            >
              CoreDXI
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <div
              style={{
                width: 40,
                height: 3,
                backgroundColor: "#1E4E8C",
                borderRadius: 2,
              }}
            />
            <span style={{ fontSize: 18, color: "#94a3b8", fontWeight: 500 }}>
              AI 기반 AX 전환 솔루션
            </span>
          </div>
        </div>

        {/* 중앙: 메인 헤드라인 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
            }}
          >
            비즈니스의 중심을
            <br />
            <span style={{ color: "#3b82f6" }}>AI로 깨우다</span>
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#94a3b8",
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: 700,
            }}
          >
            복잡한 협업은 심플하게, 변화는 단단하게.
            <br />
            당신의 AX 코어 파트너, CoreDXI.
          </div>
        </div>

        {/* 하단: 수치 배지 3개 */}
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { num: "50+", label: "도입 기업" },
            { num: "98%", label: "고객 만족도" },
            { num: "3×", label: "업무 효율" },
          ].map(({ num, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "rgba(30,78,140,0.25)",
                border: "1px solid rgba(30,78,140,0.5)",
                borderRadius: 12,
                padding: "12px 20px",
              }}
            >
              <span
                style={{ fontSize: 28, fontWeight: 800, color: "#3b82f6" }}
              >
                {num}
              </span>
              <span style={{ fontSize: 16, color: "#cbd5e1" }}>{label}</span>
            </div>
          ))}

          {/* 우측 정렬: URL */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 18, color: "#475569", fontWeight: 500 }}>
              www.coredxi.com
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
