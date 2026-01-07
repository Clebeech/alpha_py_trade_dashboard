import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// 自动生成文件列表的插件
const generateFileList = () => {
  const generate = () => {
    try {
      const dataDir = path.resolve(__dirname, 'public/data')
      const outputFile = path.resolve(dataDir, 'file-list.json')
      
      if (!fs.existsSync(dataDir)) return

      const files = fs.readdirSync(dataDir)
        .filter(file => file.startsWith('parallel_result_') && file.endsWith('.tsv'))
        .sort((a, b) => b.localeCompare(a)) // 降序排列（最新日期在前）

      fs.writeFileSync(outputFile, JSON.stringify(files, null, 2))
      console.log(`[File List] Updated index with ${files.length} files.`)
    } catch (e) {
      console.error('[File List] Error generating list:', e)
    }
  }

  return {
    name: 'generate-file-list',
    buildStart() {
      generate()
    },
    configureServer(server) {
      generate()
      // 监听 data 目录变化
      server.watcher.on('all', (event, file) => {
        if (file.includes('public/data') && file.endsWith('.tsv')) {
          generate()
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), generateFileList()],
  server: {
    port: 3000,
    open: true
  }
})

