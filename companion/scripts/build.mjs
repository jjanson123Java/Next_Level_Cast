import { build } from "esbuild";
import { cp, mkdir } from "node:fs/promises";

await mkdir("dist/main", { recursive: true });
await mkdir("dist/preload", { recursive: true });
await mkdir("dist/renderer/assets", { recursive: true });
await build({ entryPoints: ["src/main/index.ts"], bundle: true, platform: "node", format: "cjs", external: ["electron"], outfile: "dist/main/index.cjs" });
await build({ entryPoints: ["src/preload/runtime.ts"], bundle: true, platform: "node", format: "cjs", external: ["electron"], outfile: "dist/preload/index.cjs" });
await build({ entryPoints: ["src/renderer/app.ts"], bundle: true, platform: "browser", format: "iife", outfile: "dist/renderer/app.js" });
await cp("src/renderer/index.html", "dist/renderer/index.html");
await cp("src/renderer/styles.css", "dist/renderer/styles.css");
await cp("src/renderer/preview.css", "dist/renderer/preview.css");
await cp("../public/brand/next-level-cast-cover.png", "dist/renderer/assets/next-level-cast-cover.png");
await cp("../public/media/level-completed-welcome.mp3", "dist/renderer/assets/level-completed-welcome.mp3");
