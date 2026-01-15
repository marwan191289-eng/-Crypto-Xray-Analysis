import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
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
            "radial-gradient(circle at 30% 20%, rgba(34, 211, 238, 0.35), transparent 55%), radial-gradient(circle at 70% 35%, rgba(167, 139, 250, 0.30), transparent 55%)",
          color: "#e2e8f0",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, rgba(34,211,238,1), rgba(167,139,250,1))",
              }}
            />
            <div style={{ fontSize: 28, letterSpacing: 2, opacity: 0.9 }}>
              TradeXray
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 58, lineHeight: 1.05, fontWeight: 700 }}>
              Institutional AI
            </div>
            <div style={{ fontSize: 58, lineHeight: 1.05, fontWeight: 700 }}>
              Market Intelligence
            </div>
          </div>

          <div style={{ fontSize: 24, lineHeight: 1.35, opacity: 0.85 }}>
            Neural forecasting • Whale analytics • Liquidity mapping
          </div>
        </div>
      </div>
    ),
    size
  );
}
