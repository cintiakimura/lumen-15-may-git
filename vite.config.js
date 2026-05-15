import lumenVitePlugin from "@lumen/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

function mirrorLumenEnvForBundledPlugin(mode, root) {
  const env = loadEnv(mode, root, '')
  const pairs = [
    ['VITE_LUMEN_APP_BASE_URL', 'VITE_BASE44_APP_BASE_URL'],
    ['VITE_LUMEN_APP_ID', 'VITE_BASE44_APP_ID'],
    ['VITE_LUMEN_FUNCTIONS_VERSION', 'VITE_BASE44_FUNCTIONS_VERSION'],
  ]
  for (const [lumenKey, pluginKey] of pairs) {
    const v = env[lumenKey]
    if (v && !env[pluginKey]) {
      process.env[pluginKey] = v
    }
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  mirrorLumenEnvForBundledPlugin(mode, process.cwd())
  return {
    logLevel: 'error', // Suppress warnings, only show errors
    plugins: [
      lumenVitePlugin({
        // Support for legacy code that imports the platform SDK with @/integrations, @/entities, etc.
        // can be removed if the code has been updated to use direct imports from @lumen/sdk
        legacySDKImports: process.env.LUMEN_LEGACY_SDK_IMPORTS === 'true',
        hmrNotifier: true,
        navigationNotifier: true,
        visualEditAgent: true
      }),
      react(),
    ],
  }
})