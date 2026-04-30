import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    dts({ 
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
      rollupTypes: true,
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'TelegramSupportBot',
      fileName: 'main',
      formats: ['es', 'umd']
    },
    rollupOptions: {
    }
  }
})
