import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// Shared renderer for the per-page Open Graph / Twitter cards. Everything is
// rendered at build time (the routes are static), so fonts and images are
// read straight from disk.

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const root = process.cwd();

async function dataUrl(publicPath: string) {
  const file = await readFile(path.join(root, "public", publicPath));
  const ext = path.extname(publicPath).slice(1).toLowerCase();
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
  return `data:${mime};base64,${file.toString("base64")}`;
}

type OgCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Path under public/, e.g. "/logos/fomo_logo.png". */
  image?: string;
  /** Portrait photos get a taller frame than square logos. */
  imageShape?: "square" | "portrait";
  tags?: string[];
};

export async function renderOgCard({
  eyebrow,
  title,
  description,
  image,
  imageShape = "square",
  tags = [],
}: OgCardProps) {
  const [regular, semibold, imageSrc] = await Promise.all([
    readFile(path.join(root, "assets/og/inter-400.ttf")),
    readFile(path.join(root, "assets/og/inter-600.ttf")),
    image ? dataUrl(image) : Promise.resolve(null),
  ]);

  const frame =
    imageShape === "portrait"
      ? { width: 208, height: 284, radius: 28 }
      : { width: 176, height: 176, radius: 36 };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#101011",
          color: "#ededed",
          fontFamily: "Inter",
          padding: "72px 80px",
        }}
      >
        {/* Faint grid, echoing the hero picture on the site. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(ellipse 70% 80% at 30% 45%, rgba(16,16,17,0.55) 0%, #101011 75%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 56 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  fontSize: 26,
                  color: "#8fb6d2",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 22,
                }}
              >
                {eyebrow}
              </div>
              <div
                style={{
                  fontSize: title.length > 22 ? 64 : 80,
                  fontWeight: 600,
                  lineHeight: 1.05,
                  color: "#fafafa",
                  marginBottom: 26,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 30,
                  lineHeight: 1.4,
                  color: "#a1a1aa",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {description}
              </div>
            </div>

            {imageSrc ? (
              <div
                style={{
                  display: "flex",
                  width: frame.width,
                  height: frame.height,
                  borderRadius: frame.radius,
                  overflow: "hidden",
                  border: "2px solid #27272a",
                  background: "#09090b",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSrc}
                  alt=""
                  width={frame.width}
                  height={frame.height}
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              {tags.slice(0, 4).map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    fontSize: 22,
                    color: "#a1a1aa",
                    background: "#27272a",
                    borderRadius: 999,
                    padding: "8px 20px",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", fontSize: 28, color: "#71717a" }}>
              yessine.dev
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: semibold, weight: 600, style: "normal" },
      ],
    }
  );
}
