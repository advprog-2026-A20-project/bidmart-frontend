import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const runtimeConfigPath = resolve(projectRoot, 'public/runtime-config.js')
const apiBaseUrl = process.env.VITE_API_BASE_URL || ''

const escapedApiBaseUrl = JSON.stringify(apiBaseUrl)

writeFileSync(
  runtimeConfigPath,
  `window.__BIDMART_API_URL__ = ${escapedApiBaseUrl};\n`,
)

