// vite.config.js
import { resolve } from 'path'

import { defineConfig } from 'vite'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'
export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                city: resolve(__dirname, '城市/index.html'),
            },
        },
    },
    plugins: [topLevelAwait({
        promiseExportName: '__tla',
        promiseImportName: i => `__tla_${i}`
    })],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    }
})