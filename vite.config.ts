import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import postcssPxToRem from 'postcss-pxtorem'
import lessPluginAutoPrefix from 'less-plugin-autoprefix'
import cssnano from 'cssnano'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: 'last 2 versions, not dead'
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    },
  },
  css: {
    postcss: {
      plugins: [postcssPxToRem({
        rootValue: 16,
        propList: ['*'],
        unitPrecision: 6,
        selectorBlackList: ['norem']
      }), cssnano({})]
    },
    preprocessorOptions: {
      less: {
        plugins: [
          new lessPluginAutoPrefix({
            browsers: ['last 2 versions', 'not dead'],
          })
        ],
        'async': true,
        javascriptEnabled: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'router-view': ['./src/views/Article', './src/views/Home', './src/views/NotFound', './src/views/User']
        }
      }
    }
  }
})
