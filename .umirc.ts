import { defineConfig } from "umi";
import { GenerateSW } from "workbox-webpack-plugin";
interface HistoryType {
  type: "browser" | "hash" | "memory";
}

interface SsrType {
  ssr: { mode: "stream" | "string"; devServerRender: boolean };
  exportStatic: {
    htmlSuffix?: boolean;
    dynamicRoot?: boolean;
    supportWin?: boolean;
    /**
     * extra render paths only enable in ssr
     */
    extraRoutePaths?: () => any;
  };
}

const spaConfig: { history: HistoryType } = {
  history: { type: "hash" },
};

const ssrConfig: SsrType = {
  ssr: { mode: "stream", devServerRender: true },
  exportStatic: {},
};
export default defineConfig({
  npmClient: "yarn",
  mfsu: false,
  chainWebpack(memo) {
    if (process.env.NODE_ENV !== "development") {
      memo.plugin("workbox").use(GenerateSW, [
        {
          cacheId: "webpack-pwa", // 设置前缀
          skipWaiting: true, // 强制等待中的 Service Worker 被激活
          clientsClaim: true, // Service Worker 被激活后使其立即获得页面控制权
          cleanupOutdatedCaches: true, //删除过时、老版本的缓存
          swDest: "service-wroker.js", // 输出 Service worker 文件
          include: ["**/*.{html,js,css,png.jpg}"], // 匹配的文件
          exclude: ["service-wroker.js"], // 忽略的文件
          runtimeCaching: [
            {
              urlPattern: /.*\.js.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "seed-js",
                expiration: {
                  maxEntries: 20, //最多缓存20个，超过的按照LRU原则删除
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
              },
            },
            {
              urlPattern: /.*css.*/,
              handler: "CacheFirst",
              options: {
                cacheName: "seed-css",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 7 * 24 * 60 * 60,
                },
              },
            },
            {
              urlPattern: /.*(png|svga).*/,
              handler: "CacheFirst",
              options: {
                cacheName: "seed-image",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 7 * 24 * 60 * 60,
                },
              },
            },
          ],
        },
      ]);
    }
  },
});
