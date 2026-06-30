import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Video,
  staticFile,
} from "remotion";

export type CaseStudyProps = {
  brand: string;
  tagline: string;
  role: string;
  year: string;
  region: string;
  accentColor: string;
  stats: { label: string; value: string }[];
  services: string[];
  logoUrl?: string;
  /** Path to a local video file placed in animations/public/, e.g. "me.mp4" */
  videoSrc?: string;
};

function fadeUp(frame: number, delay: number, fps: number) {
  return spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 }, durationInFrames: 40 });
}

function Counter({ value, frame, delay, fps }: { value: string; frame: number; delay: number; fps: number }) {
  const num = parseFloat(value.replace(/[^0-9.]/g, ""));
  const suffix = value.replace(/[0-9.]/g, "");
  const progress = interpolate(frame - delay, [0, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const displayed = isNaN(num) ? value : Math.round(num * progress) + suffix;
  return <>{displayed}</>;
}

export const CaseStudy: React.FC<CaseStudyProps> = ({
  brand, tagline, role, year, region, accentColor, stats, services, logoUrl, videoSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = fadeUp(frame, 20, fps);
  const taglineOpacity = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const statsOpacity = interpolate(frame, [80, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const servicesOpacity = interpolate(frame, [120, 145], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [10, 60], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const hasVideo = Boolean(videoSrc);

  return (
    <AbsoluteFill style={{ background: hasVideo ? "transparent" : "#09090c", fontFamily: "Inter, system-ui, sans-serif", color: "#f3f0eb" }}>

      {/* Footage layer — only when a video is provided */}
      {hasVideo && (
        <AbsoluteFill>
          <Video src={staticFile(videoSrc!)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {/* Dark scrim so graphics stay readable over any footage */}
          <AbsoluteFill style={{ background: "rgba(0,0,0,0.45)" }} />
        </AbsoluteFill>
      )}

      {/* Grid background — subtle when over video, more visible on solid bg */}
      <AbsoluteFill style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      {/* Accent glow */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at 15% 50%, ${accentColor}22 0%, transparent 55%)`,
      }} />

      {/* Left panel */}
      <div style={{
        position: "absolute", left: 72, top: 0, bottom: 0,
        display: "flex", flexDirection: "column", justifyContent: "center", width: 560,
      }}>

        {/* Accent line */}
        <div style={{
          width: `${lineWidth}%`, maxWidth: 64, height: 3,
          background: accentColor, borderRadius: 2, marginBottom: 28,
        }} />

        {/* Role / Year / Region */}
        <p style={{
          fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
          color: accentColor, marginBottom: 16, fontWeight: 600,
          opacity: fadeUp(frame, 5, fps),
        }}>
          {role} · {year} · {region}
        </p>

        {/* Brand name */}
        <h1 style={{
          fontSize: 96, fontWeight: 900, lineHeight: 0.88,
          letterSpacing: "-3px", marginBottom: 20,
          transform: `translateY(${interpolate(titleScale, [0, 1], [40, 0])}px)`,
          opacity: titleScale,
        }}>
          {brand}
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 18, color: "#b5b0a6", lineHeight: 1.6,
          maxWidth: 460, marginBottom: 48,
          opacity: taglineOpacity,
          transform: `translateY(${interpolate(taglineOpacity, [0, 1], [12, 0])}px)`,
        }}>
          {tagline}
        </p>

        {/* Services chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, opacity: servicesOpacity }}>
          {services.map((s, i) => (
            <span key={i} style={{
              fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "6px 14px", border: `1px solid ${accentColor}`,
              borderRadius: 99, color: accentColor, fontWeight: 600,
            }}>{s}</span>
          ))}
        </div>
      </div>

      {/* Right panel — stats */}
      <div style={{
        position: "absolute", right: 72, top: 0, bottom: 0,
        display: "flex", flexDirection: "column", justifyContent: "center",
        gap: 2, opacity: statsOpacity, width: 340,
      }}>
        {stats.map((stat, i) => (
          <div key={i} style={{
            background: hasVideo ? "rgba(14,14,16,0.72)" : "#16161a",
            border: "1px solid #252532",
            backdropFilter: hasVideo ? "blur(12px)" : "none",
            borderLeft: `3px solid ${accentColor}`,
            borderRadius: "0 8px 8px 0", padding: "22px 28px",
            transform: `translateX(${interpolate(statsOpacity, [0, 1], [30, 0])}px)`,
          }}>
            <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#706c64", marginBottom: 6 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, color: accentColor, letterSpacing: "-1.5px", lineHeight: 1 }}>
              <Counter value={stat.value} frame={frame} delay={85 + i * 10} fps={fps} />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 48, borderTop: "1px solid #252532",
        background: hasVideo ? "rgba(9,9,12,0.6)" : "transparent",
        backdropFilter: hasVideo ? "blur(8px)" : "none",
        display: "flex", alignItems: "center", padding: "0 72px",
        justifyContent: "space-between",
        opacity: interpolate(frame, [140, 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: "-0.3px", color: "#b5b0a6" }}>
          ZI<span style={{ color: "#f0c233" }}>ZO</span>
        </span>
        <span style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#706c64" }}>
          abdelazizaskar.com
        </span>
      </div>
    </AbsoluteFill>
  );
};
