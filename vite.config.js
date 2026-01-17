import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import postcss from "postcss";
import fs from "fs";
import crypto from "crypto";
import * as tar from "tar";
import { validate } from "@budibase/backend-core/plugins";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

const clean = () => ({
  name: "clean",
  apply: "build",
  buildStart() {
    const dist = "./dist/";
    if (fs.existsSync(dist)) {
      fs.readdirSync(dist).forEach((path) => {
        if (path.endsWith(".tar.gz")) {
          fs.unlinkSync(dist + path);
        }
      });
    }
  },
});

const validateSchema = () => ({
  name: "validate-schema",
  apply: "build",
  buildStart() {
    const schema = fs.readFileSync("schema.json", "utf8");
    validate(JSON.parse(schema));
  },
});

const injectCss = () => ({
  name: "inject-css",
  apply: "build",
  async writeBundle() {
    const distDir = "dist";
    const files = fs.readdirSync(distDir);
    const cssFile = files.find((f) => f.endsWith(".css") && !f.startsWith("."));
    const jsFile = "plugin.min.js";

    if (cssFile) {
      const cssContent = fs.readFileSync(`${distDir}/${cssFile}`, "utf8");
      const jsContent = fs.readFileSync(`${distDir}/${jsFile}`, "utf8");

      // Inject CSS into JS as a style tag injection IIFE
      const cssInjection = `
(function() {
  const css = ${JSON.stringify(cssContent)};
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();
`;

      const updatedJs = cssInjection + jsContent;
      fs.writeFileSync(`${distDir}/${jsFile}`, updatedJs);

      // Remove the CSS file
      fs.unlinkSync(`${distDir}/${cssFile}`);
    }
  },
});

const bundle = () => ({
  name: "bundle",
  apply: "build",
  async writeBundle() {
    // Add a small delay to ensure all files are fully written before tarring
    await new Promise((resolve) => setTimeout(resolve, 100));

    const bundleName = `${pkg.name}-${pkg.version}.tar.gz`;
    return new Promise((resolve, reject) => {
      tar
        .c({ gzip: true, cwd: "dist" }, [
          "plugin.min.js",
          "schema.json",
          "package.json",
        ])
        .pipe(fs.createWriteStream(`dist/${bundleName}`))
        .on("finish", resolve)
        .on("error", reject);
    });
  },
});

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        compatibility: {
          componentApi: 4,
        },
      },
      emitCss: true,
      preprocess: [],
    }),
    postcss(),
  ],
  build: {
    target: "esnext",
    lib: {
      entry: "index.ts",
      name: "plugin",
      formats: ["iife"],
      fileName: () => "plugin.min.js",
    },
    minify: "terser",
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      external: (id) => id === "svelte" || id.startsWith("svelte/"),
      output: {
        globals: (id) => {
          if (id === "svelte/store") return "svelteStore";
          if (id === "svelte/transition") return "svelteTransition";
          if (id === "svelte/animate") return "svelteAnimate";
          if (id === "svelte/motion") return "svelteMotion";
          if (id === "svelte/easing") return "svelteEasing";
          if (id.includes("/internal")) return "svelteInternal";
          return "svelte";
        },
        sourcemap: false,
      },
      plugins: [
        validateSchema(),
        clean(),
        injectCss(),
        {
          name: "copy-and-hash-assets",
          apply: "build",
          async writeBundle() {
            // Copy schema.json and package.json to dist
            fs.copyFileSync("schema.json", "dist/schema.json");
            fs.copyFileSync("package.json", "dist/package.json");

            // Generate JS hash
            const fileBuffer = fs.readFileSync("dist/plugin.min.js");
            const hashSum = crypto.createHash("sha1");
            hashSum.update(fileBuffer);
            const hex = hashSum.digest("hex");

            // Update schema with hash
            const schema = JSON.parse(
              fs.readFileSync("dist/schema.json", "utf8")
            );
            const newSchema = {
              ...schema,
              hash: hex,
              version: pkg.version,
            };
            fs.writeFileSync(
              "dist/schema.json",
              JSON.stringify(newSchema, null, 2)
            );
          },
        },
        bundle(),
      ],
    },
  },
});
