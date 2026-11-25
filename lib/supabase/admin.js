import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

function getJwtRole(key) {
  const payload = key.split(".")[1];
  if (!payload) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).role || null;
  } catch {
    return null;
  }
}

/**
 * Service-role client — server-only. Never import in client components.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  const keyRole = getJwtRole(serviceKey);
  if (keyRole && keyRole !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY must be a service-role key; configured JWT role is "${keyRole}".`,
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: WebSocket },
  });
}
