const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')
const fs = require('fs')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]

// A stale ~/node_modules (a known cruft on this machine — see CLAUDE.md) makes
// Metro's default emptyModulePath escape to /Users/<user>/node_modules/metro-runtime.
// Pin it to the workspace's own metro-runtime (resolved via pnpm's store) so the
// bundle never reaches above the repo.
const pnpmDir = path.resolve(workspaceRoot, 'node_modules/.pnpm')
const metroRuntimeDir = fs.readdirSync(pnpmDir).find((d) => d.startsWith('metro-runtime@'))
if (metroRuntimeDir) {
  config.resolver.emptyModulePath = path.join(
    pnpmDir,
    metroRuntimeDir,
    'node_modules/metro-runtime/src/modules/empty-module.js',
  )
}
// Hierarchical lookup must stay ENABLED for pnpm: Metro walks up into the
// nested .pnpm/<pkg>/node_modules trees to resolve a package's own deps
// (e.g. expo-router → @expo/metro-runtime). Disabling it breaks those.

// Web-only: stub native/optional Node modules that Supabase pulls in but that
// have no place in a browser bundle (otel is an optional peer; ws is replaced
// by the browser's WebSocket). Native bundles are untouched.
const STUB_ON_WEB = new Set(['@opentelemetry/api', 'ws'])
const baseResolveRequest = config.resolver.resolveRequest
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && STUB_ON_WEB.has(moduleName)) {
    return { type: 'empty' }
  }
  return baseResolveRequest
    ? baseResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
