import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // build:{
  //   //  关闭文件hash，避免graalvm 静态资源配置
  //   chunkFileName:'[name].[ext]',
  //   assetFileName:'[name].[ext]'
  // },
  plugins: [vue()],
  server:{
    proxy:{
      "/sudoku/new":{
        target:"http://127.0.0.1:25895/"
      }
    }
  }
})
