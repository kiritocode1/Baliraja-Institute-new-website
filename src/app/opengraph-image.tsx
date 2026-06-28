// biome-ignore-all lint/performance/noImgElement: next/image cannot be used inside next/og ImageResponse JSX.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { defaultOgImageAlt } from "@/lib/seo";
import { site } from "@/lib/site";

export const alt = defaultOgImageAlt;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function publicImageDataUrl(fileName: string, mimeType: string) {
  const file = await readFile(join(process.cwd(), "public", fileName));
  return `data:${mimeType};base64,${file.toString("base64")}`;
}

export default async function OpenGraphImage() {
  const heroPoster = await publicImageDataUrl("hero-poster.jpg", "image/jpeg");

  return new ImageResponse(
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "hidden",
        background: "#152a35",
        color: "#f7f0df",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <img
        alt=""
        src={heroPoster}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background:
            "linear-gradient(180deg, rgba(22,42,52,0.40) 0%, rgba(22,42,52,0.12) 34%, rgba(18,15,12,0.84) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 44,
          left: 64,
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(247,240,223,0.55)",
            background: "rgba(22,42,52,0.34)",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          BI
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 20,
            lineHeight: 1.2,
          }}
        >
          <div
            style={{
              textTransform: "uppercase",
              letterSpacing: 4,
              fontWeight: 700,
            }}
          >
            {site.name}
          </div>
          <div style={{ color: "rgba(247,240,223,0.72)" }}>
            {`${site.place} · Estd. ${site.established}`}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 64,
          bottom: 56,
          left: 64,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            maxWidth: 560,
            fontSize: 27,
            lineHeight: 1.28,
            color: "rgba(247,240,223,0.88)",
          }}
        >
          {
            "Career academy in Gangapur for public service, defence, banking, police and state exam aspirants."
          }
        </div>
        <div
          style={{
            marginTop: 24,
            height: 1,
            width: "100%",
            background: "rgba(247,240,223,0.35)",
          }}
        />
        <div
          style={{
            marginTop: 26,
            fontSize: 108,
            lineHeight: 0.88,
            fontWeight: 400,
            letterSpacing: 0,
            whiteSpace: "nowrap",
          }}
        >
          Discover Your Path
        </div>
        <div
          style={{
            marginTop: 26,
            display: "flex",
            gap: 20,
            fontSize: 22,
            textTransform: "uppercase",
            letterSpacing: 4,
            color: "rgba(247,240,223,0.76)",
          }}
        >
          <span>MPSC</span>
          <span>UPSC</span>
          <span>Defence</span>
          <span>Banking</span>
          <span>SSC</span>
          <span>Police</span>
        </div>
      </div>
    </div>,
    size,
  );
}
