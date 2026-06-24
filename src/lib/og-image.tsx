import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BRAND = "#1E4E8C";
const ACCENT = "#3b82f6";

type OgCardInput = {
  badge: string;
  title: string;
  subtitle: string;
  footer?: string;
};

export function createOgImageResponse({
  badge,
  title,
  subtitle,
  footer = "www.coredxi.com",
}: OgCardInput) {
  return new ImageResponse(
    (
      <div
        style={{
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              backgroundColor: BRAND,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: "3px solid white",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.5px",
            }}
          >
            CoreDXI
          </span>
          <span style={{ fontSize: 18, color: "#64748b", marginLeft: 8 }}>
            {badge}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              width: 48,
              height: 4,
              backgroundColor: BRAND,
              borderRadius: 2,
            }}
          />
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <span
            style={{
              fontSize: 24,
              color: "#94a3b8",
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: 900,
            }}
          >
            {subtitle}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 18, color: ACCENT }}>{footer}</span>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
