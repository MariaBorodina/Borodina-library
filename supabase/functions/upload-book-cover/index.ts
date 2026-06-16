import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function buildCorsHeaders(req: Request): HeadersInit {
  const requestOrigin = req.headers.get("Origin");
  const requestHeaders = req.headers.get("Access-Control-Request-Headers");

  return {
    "Access-Control-Allow-Origin": requestOrigin ?? "*",
    "Access-Control-Allow-Headers":
      requestHeaders ?? "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin, Access-Control-Request-Headers",
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = buildCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let path: string | null = null;
    let contentType: string | null = null;
    let upsert = false;
    let bytes = new Uint8Array();

    const requestUrl = new URL(req.url);
    const queryPath = requestUrl.searchParams.get("path");
    const queryContentType = requestUrl.searchParams.get("contentType");
    const queryUpsert = requestUrl.searchParams.get("upsert");

    if (queryPath && queryContentType) {
      path = queryPath;
      contentType = queryContentType;
      upsert = queryUpsert === "true";
      bytes = new Uint8Array(await req.arrayBuffer());
    } else {
      const body = await req.json().catch(() => null) as
        | { path?: string; contentType?: string; upsert?: boolean; data?: string }
        | null;
      path = body?.path ?? null;
      contentType = body?.contentType ?? null;
      upsert = body?.upsert === true;

      if (body?.data) {
        bytes = Uint8Array.from(atob(body.data), (c) => c.charCodeAt(0));
      }
    }

    if (!path || !contentType) {
      return new Response(JSON.stringify({ error: "Missing path or contentType" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (bytes.byteLength === 0) {
      return new Response(JSON.stringify({ error: "Empty upload body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: quotaOk, error: quotaError } = await supabase.rpc("check_storage_quota", {
      p_additional_bytes: bytes.byteLength,
    });

    if (quotaError) {
      return new Response(JSON.stringify({ error: quotaError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!quotaOk) {
      return new Response(JSON.stringify({ error: "Storage quota exceeded" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: uploadError } = await supabase.storage.from("book-covers").upload(path, bytes, {
      contentType,
      upsert,
      cacheControl: "3600",
    });

    if (uploadError) {
      const statusCode = Number(uploadError.statusCode);
      const status = Number.isFinite(statusCode) && statusCode >= 400 ? statusCode : 400;
      return new Response(JSON.stringify({ error: uploadError.message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
