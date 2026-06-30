import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "npm:@aws-sdk/client-s3@3.864.0";

function buildCorsHeaders(req: Request): HeadersInit {
  const requestOrigin = req.headers.get("Origin");
  const requestHeaders = req.headers.get("Access-Control-Request-Headers");

  return {
    "Access-Control-Allow-Origin": requestOrigin ?? "*",
    "Access-Control-Allow-Headers":
       "authorization, x-client-info, apikey, content-type, accept, origin, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin, Access-Control-Request-Headers",
  };
}

const ALLOWED_COVER_TYPES = new Set(["image/jpeg", "image/png"]);
const MAX_COVER_BYTES = 5_242_880;
const COVER_PATH_RE = /^[^/]+\/[^/]+\/cover\.(jpg|jpeg|png)$/i;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseCoverPath(path: string): { authorId: string; bookId: string } | null {
  const match = path.match(/^([^/]+)\/([^/]+)\/cover\.(jpg|jpeg|png)$/i);
  if (!match) {
    return null;
  }

  const authorId = match[1];
  const bookId = match[2];
  if (!UUID_RE.test(authorId) || !UUID_RE.test(bookId)) {
    return null;
  }

  return { authorId, bookId };
}

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function resolvePublicBaseUrl(endpoint: string, bucket: string): string {
  const configuredBase = Deno.env.get("YC_STORAGE_PUBLIC_BASE_URL")?.trim();
  if (configuredBase) {
    return configuredBase.replace(/\/+$/, "");
  }

  const normalized = endpoint.replace(/\/+$/, "");
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return `${normalized}/${bucket}`;
  }

  return `https://${normalized}/${bucket}`;
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

    if (!ALLOWED_COVER_TYPES.has(contentType)) {
      return new Response(JSON.stringify({ error: "Unsupported cover content type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (bytes.byteLength > MAX_COVER_BYTES) {
      return new Response(JSON.stringify({ error: "Cover file is too large" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!COVER_PATH_RE.test(path)) {
      return new Response(JSON.stringify({ error: "Invalid cover path format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const coverPath = parseCoverPath(path);
    if (!coverPath) {
      return new Response(JSON.stringify({ error: "Invalid cover path format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (coverPath.authorId !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: book, error: bookError } = await supabase
      .from("books")
      .select("id, author_id")
      .eq("id", coverPath.bookId)
      .maybeSingle();

    if (bookError || !book || book.author_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const endpoint = getRequiredEnv("YC_STORAGE_ENDPOINT");
    const region = getRequiredEnv("YC_STORAGE_REGION");
    const accessKeyId = getRequiredEnv("YC_STORAGE_ACCESS_KEY_ID");
    const secretAccessKey = getRequiredEnv("YC_STORAGE_SECRET_ACCESS_KEY");
    const bucket = getRequiredEnv("YC_STORAGE_BUCKET");
    const publicBaseUrl = resolvePublicBaseUrl(endpoint, bucket);

    const s3Client = new S3Client({
      endpoint: endpoint.startsWith("http://") || endpoint.startsWith("https://")
        ? endpoint
        : `https://${endpoint}`,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });

    if (!upsert) {
      try {
        await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: path }));
        return new Response(JSON.stringify({ error: "Cover already exists" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (headError) {
        if (!(headError instanceof S3ServiceException && headError.name === "NotFound")) {
          throw headError;
        }
      }
    }

    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: bytes,
        ContentType: contentType,
        CacheControl: "public, max-age=3600",
        ACL: "public-read",
      }));
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed";
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ path, publicUrl: `${publicBaseUrl}/${path}` }), {
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
