import { defineConfig } from 'vite';
import { resolve } from 'path';

/**
 * SDK 打包配置
 * 输出单个 IIFE 格式的 JS 文件，可直接通过 script 标签引入
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'AIAssistant',
      fileName: () => 'ai-sdk.js',
      formats: ['iife']
    },
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
