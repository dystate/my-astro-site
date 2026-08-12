/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_SUPABASE_BUCKET?: string;
  readonly PUBLIC_DEV_BYPASS_AUTH?: string;
  readonly PUBLIC_DESKTOP_MODE?: string;
  readonly PUBLIC_MOBILE_MODE?: string;
  readonly PUBLIC_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
