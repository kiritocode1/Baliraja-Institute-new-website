import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.longName} in ${site.place}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#f7efe1",
        color: "#531c21",
        padding: "58px 64px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          border: "3px solid #531c21",
          padding: "52px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 118,
              height: 118,
              borderRadius: 32,
              background: "#531c21",
              color: "#f7efe1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 54,
              fontWeight: 700,
              letterSpacing: 0,
            }}
          >
            BI
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 0,
                textTransform: "uppercase",
              }}
            >
              {`${site.place} | Estd. ${site.established}`}
            </div>
            <div style={{ marginTop: 10, fontSize: 30, color: "#8a6325" }}>
              {site.motto}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              maxWidth: 880,
              fontSize: 82,
              lineHeight: 0.96,
              letterSpacing: 0,
            }}
          >
            {site.longName}
          </div>
          <div
            style={{
              marginTop: 28,
              maxWidth: 860,
              fontSize: 32,
              lineHeight: 1.32,
              color: "#3d3127",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {
              "MPSC, UPSC, Army, Navy, Banking, SSC, Police Bharti, Talathi and ZP exam preparation."
            }
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
