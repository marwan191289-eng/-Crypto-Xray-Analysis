import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 600,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage:
            "radial-gradient(circle at 35% 20%, rgba(34, 211, 238, 0.35), transparent 55%), radial-gradient(circle at 75% 40%, rgba(167, 139, 250, 0.30), transparent 55%)",
          color: "#e2e8f0",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          padding: "70px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background:
                  "linear-gradient(135deg, rgba(34,211,238,1), rgba(167,139,250,1))",
              }}
            />
            <div style={{ fontSize: 24, letterSpacing: 1.6, opacity: 0.9 }}>
              TradeXray
            </div>
          </div>

          <div style={{ fontSize: 52, lineHeight: 1.05, fontWeight: 700 }}>
            AI market intelligence
          </div>

          <div style={{ fontSize: 22, lineHeight: 1.35, opacity: 0.85 }}>
            For traders who can’t afford to guess.
          </div>
        </div>
      </div>
    ),
    size
  );
}
