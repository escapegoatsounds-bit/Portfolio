/**
 * render.mjs — render a single case study video
 * Usage: node render.mjs [compositionId] [outputFile]
 * Example: node render.mjs CaseStudy out/krispy-kreme.mp4
 */

import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── FFmpeg path (your local install on D:) ───────────────────────────────────
const FFMPEG_PATH = "D:\\ffmpeg-7.1.1-essentials_build\\bin\\ffmpeg.exe";
const FFPROBE_PATH = "D:\\ffmpeg-7.1.1-essentials_build\\bin\\ffprobe.exe";

process.env.FFMPEG_BINARY = FFMPEG_PATH;
process.env.FFPROBE_BINARY = FFPROBE_PATH;

const compositionId = process.argv[2] ?? "CaseStudy";
const outputLocation = process.argv[3] ?? `out/${compositionId}.mp4`;

// ── Input props — edit these per brand ───────────────────────────────────────
const inputProps = {
  brand: "Krispy Kreme",
  tagline: "Built a local brand personality that resonated with Egyptian consumers and drove follower growth.",
  role: "Social Strategist",
  year: "2020–2021",
  region: "Egypt",
  accentColor: "#007A3D",
  stats: [
    { label: "Followers gained", value: "120K+" },
    { label: "Avg. engagement rate", value: "8.4%" },
    { label: "Campaigns delivered", value: "24" },
  ],
  services: ["Social Media", "Strategy", "Content"],
  // Optional: drop your footage into animations/public/ and set the filename here.
  // The graphics will overlay on top of your video.
  // videoSrc: "me.mp4",
};
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\nBundling composition "${compositionId}"...`);
const bundled = await bundle({
  entryPoint: path.join(__dirname, "src/index.tsx"),
  onProgress: (p) => process.stdout.write(`\r  Bundling: ${p}%`),
});
console.log("\n  Bundle ready.");

const composition = await selectComposition({ serveUrl: bundled, id: compositionId, inputProps });

console.log(`Rendering → ${outputLocation}`);
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation,
  inputProps,
  onProgress: ({ progress }) => process.stdout.write(`\r  Rendering: ${Math.round(progress * 100)}%`),
});

console.log(`\n\nDone! Video saved to: ${outputLocation}\n`);
