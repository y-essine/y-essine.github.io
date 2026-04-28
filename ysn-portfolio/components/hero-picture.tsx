import Image from "next/image";

const CELL = 42;

function Grid({ width, height }: { width: number; height: number }) {
  const cols = Math.ceil(width / CELL) + 1;
  const rows = Math.ceil(height / CELL) + 1;
  const lines = [];

  for (let i = 0; i < cols; i++) {
    const x = i * CELL;
    lines.push(
      <div
        key={`v${i}`}
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: 1,
          height,
          background: "rgba(255,255,255,0.15)",
        }}
      />
    );
  }

  for (let j = 0; j < rows; j++) {
    const y = j * CELL;
    lines.push(
      <div
        key={`h${j}`}
        style={{
          position: "absolute",
          left: 0,
          top: y,
          width,
          height: 1,
          background: "rgba(255,255,255,0.15)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
      }}
    >
      {lines}
    </div>
  );
}

export default function HeroPicture() {
  const W = 210;
  const H = 260;

  return (
    <div
      style={{
        position: "relative",
        width: W,
        height: H,
        // background: "#111111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      <Grid width={W} height={H} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 65% 65% at 50% 50%, transparent 10%, rgb(16 16 17) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
        className="overflow-hidden rounded-2xl border border-zinc-800 sm:rounded-3xl"
      >
        <Image
          src="/pfp.jpg"
          alt="Profile Picture"
          width={104}
          height={142}
          className="h-auto w-26 sm:w-30"
        />
        {/* <div
          style={{
            width: 160,
            height: 210,
            borderRadius: 24,
            background: "rgba(210,210,220,0.13)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.1), 0 24px 64px rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(100,100,110,0.6)",
            }}
          />
        </div> */}
      </div>
    </div>
  );
}
