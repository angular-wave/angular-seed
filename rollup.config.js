import { createServer } from "http";
import { cpSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import { copy } from "@web/rollup-plugin-copy";
import { bundle } from "lightningcss";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isDev = process.env.DEV === "1";
const isWatch = process.argv.includes("-w") || process.argv.includes("--watch");

/**
 * Minimal SSE live-reload rollup plugin (zero dependencies).
 * Starts an HTTP server that streams Server-Sent Events.
 * Every `writeBundle` pushes a "reload" event to every connected browser.
 */
function liveReloadPlugin(port = 35729) {
  const clients = new Set();

  const server = createServer((req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });
    clients.add(res);
    req.on("close", () => clients.delete(res));
  });

  server.listen(port, () =>
    console.log(`Live-reload SSE server on http://localhost:${port}`),
  );

  return {
    name: "live-reload",
    writeBundle() {
      for (const res of clients) {
        res.write("data: reload\n\n");
      }
    },
  };
}

/**
 * Copy @ionic/core lazy-loaded Stencil files to dist/ root.
 * Entry files use dynamic import() with computed paths at runtime and cannot
 * be resolved by rollup. They also import shared helper modules from the
 * same directory.
 */
function copyIonicEntries() {
  return {
    name: "copy-ionic-entries",
    writeBundle(options) {
      const outDir = options.dir || "dist";
      const ionicEsm = join(__dirname, "node_modules/@ionic/core/dist/esm");
      // Skip non-hashed files that would collide with rollup output
      const skip = new Set(["index.js", "loader.js"]);
      if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
      for (const file of readdirSync(ionicEsm)) {
        if (file.endsWith(".js") && !skip.has(file)) {
          cpSync(join(ionicEsm, file), join(outDir, file));
        }
      }
      console.log("Copied @ionic/core ESM files to " + outDir);
    },
  };
}

const plugins = [
  html({
    rootDir: "./app",
    minify: !isDev,
    flattenOutput: false,
    transformAsset: (_content, filePath) => {
      if (filePath.endsWith(".css")) {
        let { code } = bundle({
          filename: filePath,
          minify: !isDev,
        });
        return new TextDecoder("utf-8").decode(code);
      }
    },
  }),
  copy({
    patterns: [
      "./*.{txt,webmanifest}",
      "./apps/router/_*.html",
      "./apps/ionic/assets/**",
      "./apps/ionic/manifest.json",
      "./apps/ionic/capacitor.config.json",
    ],
    rootDir: "./app",
    exclude: ["node_modules"],
  }),
  resolve(),
  commonjs(),
  ...(isDev && isWatch ? [liveReloadPlugin()] : isDev ? [] : [terser()]),
  copyIonicEntries(),
];

export default [
  {
    input: [
      "./index.html",
      "./apps/todo/todo.html",
      "./apps/router/router.html",
      "./apps/ionic/ionic.html",
    ],
    output: {
      dir: "dist",
      entryFileNames: isDev ? "[name].js" : "[name].[hash].js",
    },
    plugins: plugins,
  },
];
