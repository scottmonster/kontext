import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig } from "vite";
import { pluginExposeRenderer } from "./vite.base.config.js";
import ckeditor5 from "@ckeditor/vite-plugin-ckeditor5";

// this came from the ckeditor project but im pretty sure it isn't needed
// import { createRequire } from 'node:module';
// const require = createRequire( import.meta.url );

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<"renderer">;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? "";

  return {
    root,
    mode,
    base: "./",
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [
      pluginExposeRenderer(name),
      ckeditor5({
        theme: require.resolve("@ckeditor/ckeditor5-theme-lark"),
      }),
    ],
    resolve: {
      preserveSymlinks: true,
    },
    clearScreen: false,
  } as UserConfig;
});
