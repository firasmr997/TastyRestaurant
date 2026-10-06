/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API base URL: `/api` (proxied, default) or an absolute URL such as https://api.tasty.example/api */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Fontsource packages expose their stylesheets through extensionless export paths (e.g. "@fontsource/barlow/400").
declare module '@fontsource/*'
declare module '@fontsource-variable/*'
