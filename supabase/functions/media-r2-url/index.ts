import { createClient } from "https://esm.sh/@supabase/supabase-js@2.105.1";

type Action =
  | "create_upload"
  | "complete_upload"
  | "create_download"
  | "delete_photo";

type MediaAssetRow = {
  id: string;
  family_id: string;
  child_id: string;
  asset_type: string;
  bucket: string;
  object_key: string;
  status: string;
  mime_type: string | null;
};

type RpcResult<T> = {
  data: T | null;
  error: { message: string } | null;
};

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, x-client-info, apikey, content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  try {
    const body = await request.json();
    const action = readAction(body);
    const supabase = createUserScopedSupabaseClient(request);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError !== null || user === null) {
      return json({ error: "unauthorized" }, 401);
    }

    if (action === "create_upload") {
      const result = await createUpload(body, supabase, user.id);

      return json(result, 200);
    }

    if (action === "complete_upload") {
      const result = await completeUpload(body, supabase);

      return json(result, 200);
    }

    if (action === "create_download") {
      const result = await createDownload(body, supabase);

      return json(result, 200);
    }

    const result = await deletePhoto(body, supabase);

    return json(result, 200);
  } catch (error) {
    return json({ error: getErrorMessage(error) }, 400);
  }
});

function createUserScopedSupabaseClient(request: Request) {
  const url = readRequiredEnv("SUPABASE_URL");
  const anonKey = readRequiredEnv("SUPABASE_ANON_KEY");
  const authorization = request.headers.get("authorization") ?? "";

  return createClient(url, anonKey, {
    global: {
      headers: { authorization },
    },
  });
}

async function createUpload(
  body: Record<string, unknown>,
  supabase: ReturnType<typeof createUserScopedSupabaseClient>,
  userId: string,
) {
  const now = new Date();
  const mediaAssetId = crypto.randomUUID();
  const bucket = readRequiredEnv("R2_BUCKET");
  const familyId = readString(body.family_id, "family_id");
  const childId = readString(body.child_id, "child_id");
  const fileName = readNullableString(body.file_name);
  const mimeType = readNullableString(body.mime_type) ?? "image/jpeg";
  const objectKey = createObjectKey({
    childId,
    familyId,
    fileName,
    mediaAssetId,
    mimeType,
  });

  const { error } = await supabase.from("media_assets").insert({
    id: mediaAssetId,
    family_id: familyId,
    child_id: childId,
    created_by: userId,
    asset_type: "photo",
    storage_provider: "r2",
    bucket,
    object_key: objectKey,
    status: "draft",
    file_name: fileName,
    file_size: readNullableNumber(body.file_size),
    mime_type: mimeType,
    width: readNullableNumber(body.width),
    height: readNullableNumber(body.height),
    captured_at: readNullableString(body.captured_at),
  });

  if (error !== null) {
    throw new Error(error.message);
  }

  const expiresInSeconds = readExpirySeconds();
  const uploadUrl = await createR2SignedUrl({
    bucket,
    expiresInSeconds,
    method: "PUT",
    objectKey,
    now,
  });

  return {
    media_asset_id: mediaAssetId,
    object_key: objectKey,
    upload_url: uploadUrl,
    expires_at: new Date(now.getTime() + expiresInSeconds * 1000).toISOString(),
  };
}

async function completeUpload(
  body: Record<string, unknown>,
  supabase: ReturnType<typeof createUserScopedSupabaseClient>,
) {
  const mediaAssetId = readString(body.media_asset_id, "media_asset_id");
  const { data, error } = await supabase
    .from("media_assets")
    .update({ status: "uploaded" })
    .eq("id", mediaAssetId)
    .select("id, object_key, status")
    .single();

  if (error !== null) {
    throw new Error(error.message);
  }

  return data;
}

async function createDownload(
  body: Record<string, unknown>,
  supabase: ReturnType<typeof createUserScopedSupabaseClient>,
) {
  const mediaAssetId = readString(body.media_asset_id, "media_asset_id");
  const { data, error } = await supabase
    .from("media_assets")
    .select(
      "id, family_id, child_id, asset_type, bucket, object_key, status, mime_type",
    )
    .eq("id", mediaAssetId)
    .single<MediaAssetRow>();

  if (error !== null) {
    throw new Error(error.message);
  }

  if (data.status !== "uploaded") {
    throw new Error("media_asset_not_uploaded");
  }

  const now = new Date();
  const expiresInSeconds = readExpirySeconds();
  const downloadUrl = await createR2SignedUrl({
    bucket: data.bucket,
    expiresInSeconds,
    method: "GET",
    objectKey: data.object_key,
    now,
  });

  return {
    media_asset_id: data.id,
    download_url: downloadUrl,
    expires_at: new Date(now.getTime() + expiresInSeconds * 1000).toISOString(),
  };
}

async function deletePhoto(
  body: Record<string, unknown>,
  supabase: ReturnType<typeof createUserScopedSupabaseClient>,
) {
  const mediaAssetId = readString(body.media_asset_id, "media_asset_id");
  const { data, error } = await supabase
    .from("media_assets")
    .select(
      "id, family_id, child_id, asset_type, bucket, object_key, status, mime_type",
    )
    .eq("id", mediaAssetId)
    .single<MediaAssetRow>();

  if (error !== null) {
    throw new Error(error.message);
  }

  if (data.asset_type !== "photo") {
    throw new Error("media_asset_not_photo");
  }

  await assertCanDeleteMediaAsset(supabase, data.family_id);

  if (data.status === "deleted") {
    return {
      media_asset_id: data.id,
      status: "deleted",
    };
  }

  const now = new Date();
  const deleteUrl = await createR2SignedUrl({
    bucket: data.bucket,
    expiresInSeconds: readExpirySeconds(),
    method: "DELETE",
    objectKey: data.object_key,
    now,
  });
  const deleteResponse = await fetch(deleteUrl, { method: "DELETE" });

  if (!deleteResponse.ok) {
    throw new Error("r2_delete_failed");
  }

  const { data: updatedAsset, error: updateError } = await supabase
    .from("media_assets")
    .update({ status: "deleted" })
    .eq("id", mediaAssetId)
    .select("id, object_key, status")
    .single();

  if (updateError !== null) {
    throw new Error(updateError.message);
  }

  return updatedAsset;
}

async function assertCanDeleteMediaAsset(
  supabase: ReturnType<typeof createUserScopedSupabaseClient>,
  familyId: string,
): Promise<void> {
  const { data, error } = (await supabase.rpc("is_family_parent", {
    target_family_id: familyId,
  })) as RpcResult<boolean>;

  if (error !== null) {
    throw new Error(error.message);
  }

  if (data !== true) {
    throw new Error("forbidden");
  }
}

function readAction(body: unknown): Action {
  if (typeof body !== "object" || body === null) {
    throw new Error("invalid_body");
  }

  const action = (body as Record<string, unknown>).action;

  if (
    action !== "create_upload" &&
    action !== "complete_upload" &&
    action !== "create_download" &&
    action !== "delete_photo"
  ) {
    throw new Error("invalid_action");
  }

  return action;
}

function createObjectKey(input: {
  childId: string;
  familyId: string;
  fileName: string | null;
  mediaAssetId: string;
  mimeType: string;
}): string {
  return [
    "families",
    input.familyId,
    "children",
    input.childId,
    "photos",
    `${input.mediaAssetId}${getFileExtension(input.fileName, input.mimeType)}`,
  ].join("/");
}

function getFileExtension(fileName: string | null, mimeType: string): string {
  const fileExtension = fileName?.match(/\.[A-Za-z0-9]+$/)?.[0].toLowerCase();

  if (fileExtension !== undefined) {
    return fileExtension;
  }

  if (mimeType === "image/png") {
    return ".png";
  }

  if (mimeType === "image/webp") {
    return ".webp";
  }

  return ".jpg";
}

async function createR2SignedUrl(input: {
  bucket: string;
  objectKey: string;
  method: "DELETE" | "GET" | "PUT";
  expiresInSeconds: number;
  now: Date;
}): Promise<string> {
  const accessKeyId = readRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = readRequiredEnv("R2_SECRET_ACCESS_KEY");
  const endpoint = new URL(readRequiredEnv("R2_S3_ENDPOINT"));
  const region = "auto";
  const service = "s3";
  const amzDate = formatAmzDate(input.now);
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const objectPath = `${input.bucket}/${input.objectKey}`
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const url = new URL(`/${objectPath}`, endpoint);

  url.searchParams.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
  url.searchParams.set(
    "X-Amz-Credential",
    `${accessKeyId}/${credentialScope}`,
  );
  url.searchParams.set("X-Amz-Date", amzDate);
  url.searchParams.set("X-Amz-Expires", String(input.expiresInSeconds));
  url.searchParams.set("X-Amz-SignedHeaders", "host");

  const canonicalQuery = [...url.searchParams.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
  const canonicalRequest = [
    input.method,
    url.pathname,
    canonicalQuery,
    `host:${url.host}`,
    "",
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");
  const signingKey = await getSigningKey(secretAccessKey, dateStamp, region, service);
  const signature = toHex(await hmac(signingKey, stringToSign));

  url.searchParams.set("X-Amz-Signature", signature);

  return url.toString();
}

async function getSigningKey(
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  service: string,
): Promise<ArrayBuffer> {
  const dateKey = await hmacText(`AWS4${secretAccessKey}`, dateStamp);
  const dateRegionKey = await hmac(dateKey, region);
  const dateRegionServiceKey = await hmac(dateRegionKey, service);

  return hmac(dateRegionServiceKey, "aws4_request");
}

async function hmacText(secret: string, message: string): Promise<ArrayBuffer> {
  return hmac(new TextEncoder().encode(secret), message);
}

async function hmac(key: BufferSource, message: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );

  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(message));
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return toHex(digest);
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function formatAmzDate(date: Date): string {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

function readString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`invalid_${name}`);
  }

  return value;
}

function readNullableString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return null;
}

function readNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }

  return null;
}

function readExpirySeconds(): number {
  const rawExpiry = Number(Deno.env.get("R2_SIGNED_URL_EXPIRES_SECONDS") ?? 600);

  if (!Number.isFinite(rawExpiry) || rawExpiry < 60 || rawExpiry > 3600) {
    return 600;
  }

  return Math.floor(rawExpiry);
}

function readRequiredEnv(name: string): string {
  const value = Deno.env.get(name);

  if (value === undefined || value.trim().length === 0) {
    throw new Error(`missing_${name}`);
  }

  return value;
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      ...corsHeaders,
      "content-type": "application/json; charset=utf-8",
    },
    status,
  });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown_error";
}
