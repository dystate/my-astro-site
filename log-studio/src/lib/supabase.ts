import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL?.trim() ?? "";
export const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
export const storageBucket = import.meta.env.PUBLIC_SUPABASE_BUCKET?.trim() || "log-assets";
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const desktopMode = import.meta.env.PUBLIC_DESKTOP_MODE === "true";
export const mobileMode = import.meta.env.PUBLIC_MOBILE_MODE === "true";
export const devBypass = (import.meta.env.DEV && import.meta.env.PUBLIC_DEV_BYPASS_AUTH === "true")
  || (desktopMode && !supabaseConfigured);

let instance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseConfigured) throw new Error("尚未配置 Supabase。请先填写 .env。 ");
  instance ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return instance;
}
