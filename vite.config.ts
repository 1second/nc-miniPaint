/// <reference types="vitest" />
import { defineConfig, Plugin, PluginOption } from "vite";
import ViteRequireContext from "@originjs/vite-plugin-require-context";
import requireTransform from "vite-plugin-require-transform";
import vue from "@vitejs/plugin-vue";
import { spawn } from "child_process";

function exec(command: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("sh", ["-c", command], {
      stdio: "inherit",
    });
    child.on("close", (code) => {
      if (code !== 0) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

const copyStatic: PluginOption = {
  name: "copy-static",
  apply: "build",
  async writeBundle() {
    await exec(`cp -r images render-dist/assets`);
  }
};

const replaceNodeModulesBadImport: Plugin = {
  name: "replace-node-module",
  enforce: "pre",
  transform(code, id) {
    if (
      id.endsWith("src/js/libs/jquery.translate.js") ||
      id.endsWith("src/js/core/components/color-picker-gradient.js") ||
      id.endsWith("src/js/core/components/color-input.js") ||
      code.indexOf("})(jQuery);") > 0
    ) {
      code = `import jQuery from 'jquery'\n;${code}\nwindow.$ = jQuery;export default {};\n`;
    }

    code = code.replace(
      `const fuzzysort = require('fuzzysort');`,
      `import fuzzysort from 'fuzzysort';`
    );

    const reg = /\.?\.\/(\.\.\/)*node_modules\//g;
    // const match = code.match(reg);
    return code.replace(reg, "");
  },
};
export default defineConfig({
  plugins: [
    vue(),
    requireTransform({}),
    replaceNodeModulesBadImport,
    ViteRequireContext({
      projectBasePath: __dirname,
    }),
    copyStatic,
  ],
  mode: process.env.NODE_ENV,
  root: __dirname,
  base: "./",
  build: {
    outDir: "render-dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  optimizeDeps: {
    include: [
      "jquery",
      "gif.js.optimized",
      "alertifyjs",
      "blueimp-canvas-to-blob",
      "file-saver",
    ],
  },
  test: {
    setupFiles: [".jest/register-context.js"],
  },
  define: {
    VERSION: JSON.stringify(require("./package.json").version),
  },
});
