/*
 * @Date: 2023-11-13 16:44:53
 * @LastEditors: 曾韩样
 * @LastEditTime: 2024-04-01 13:57:03
 */
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import svgLoader from "vite-svg-loader";
import mockDevServerPlugin from "vite-plugin-mock-dev-server";
import vueJsx from "@vitejs/plugin-vue-jsx";
import vueSetupExtend from "vite-plugin-vue-setup-extend";
import VueDevTools from "vite-plugin-vue-devtools";
import buildProcess from "vite-plugin-progress";
// import viteCompression from 'vite-plugin-compression'
import { spaLoading } from "vite-plugin-spa-loading";
import {
  ArcoResolver,
  TDesignResolver,
} from "unplugin-vue-components/resolvers";
import { transformLazyShow } from "v-lazy-show";
// import configCompressPlugin from './build/plugin/compress';
// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    plugins: [
      // VueDevTools(),
      vue({
        include: [/\.vue$/, /\.md$/],
        template: {
          compilerOptions: {
            nodeTransforms: [transformLazyShow],
          },
        },
        script: {
          defineModel: true,
        },
      }),
      vueJsx(),
      svgLoader(),
      buildProcess(),
      // https://github.com/yue1123/vite-plugin-spa-loading/blob/master/README.zh.md
      spaLoading("img", {
        src: "/logolight.png",
        devEnable: true,
        cssPath: "./src/assets/loading.css",
        tipText: `
      页面资源加载中，请稍后…… 
      <br />
      <span style="font-size: 12px;color: #999;">如果长时间无响应，请检查网络连接是否正常</span>
      <br />
      Loading resources, please wait...
      <br />
      <span style="font-size: 12px;color: #999;">If there is no response for a long time, please check whether the network connection is normal</span>
      `,
        debounce: 200,
      }),
      mockDevServerPlugin({
        prefix: "^/mock/",
        include: "src/mock/**/*.mock.{ts,js,cjs,mjs,json,json5}",
      }),
      // configCompressPlugin('gzip'),
      vueSetupExtend(),
      AutoImport({
        dts: "src/auto-imports.d.ts",
        imports: [
          "vue",
          "@vueuse/core",
          "vue-router",
          "vue-i18n",
          {
            "@/hooks/columns-config": ["useColumnsResize", "useColumnsDisplay"],
            // "@/hooks/socket": ["useGlobalSocket"],
            "@/hooks/permission": ["useHasPermission"],
          },
        ],
        resolvers: [
          ArcoResolver({ sideEffect: true }),
          TDesignResolver({
            library: "vue-next",
          }),
        ],
      }),
      // viteCompression({ filter: /\.(js|ts|json|css|less|wasm)$/i, algorithm: 'gzip', ext: '.gz', deleteOriginFile: false})
      // Components({
      //   dts: "src/components.d.ts",
      //   resolvers: [
      //     ArcoResolver({ sideEffect: true }),
      //     TDesignResolver({
      //       library: "vue-next",
      //     }),
      //   ],
      // }),
    ],
    // base: "./",
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "~": resolve(__dirname, "src/components"),
      },
    },
    clearScreen: false,
    css: {
      modules: {
        localsConvention: "camelCaseOnly",
        scopeBehaviour: "local",
      },
      preprocessorOptions: {
        less: {
          modifyVars: {
            hack: `true; @import (reference) "${resolve(
              "src/style/variables.less"
            )}";`,
          },
          math: "strict",
          javascriptEnabled: true,
        },
      },
    },
    build: {
      reportCompressedSize: false,
    },
    server: {
      port: 3400,
      host: "0.0.0.0",
      strictPort: false,
      proxy: {
        "/smartLoop": {
          target: env.VITE_BASE_URL || "",
          changeOrigin: true,
        },
        "/local/": {
          // target: "http://localhost:3100",
          changeOrigin: true,
        },
        "^/mock/": {
          target: "",
          //   // target: "http://10.13.20.26:8083",
          changeOrigin: true,
        },
      },
    },
  };
});
