"use server";

import { createSupabaseClient } from "@/lib/supabase/supabaseServer";

const API_BASE = "https://api.almostcrackd.ai";

async function getAuthToken() {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.access_token;
}

async function readTextSafe(resp: Response) {
  try {
    return await resp.text();
  } catch {
    return "";
  }
}

//Step 1. Generate Presigned URL
export async function generatePresignedUrl(contentType: string) {
  const token = await getAuthToken();
  if (!token) return { error: "Not authenticated" as const };

  const resp = await fetch(`${API_BASE}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType }),
  });

  if (!resp.ok) return { error: `Presign failed: ${resp.status} ${await readTextSafe(resp)}` as const };
  return { data: await resp.json() as { presignedUrl: string; cdnUrl: string } };
}

//2. Upload Image Bytes to PresignedURl
export async function registerImage(cdnUrl: string) {
  const token = await getAuthToken();
  if (!token) return { error: "Not authenticated" as const };

  const resp = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
  });

  if (!resp.ok) return { error: `Register failed: ${resp.status} ${await readTextSafe(resp)}` as const };
  return { data: await resp.json() as { imageId: string; now?: number } };
}

//3. Generating Captions
export async function generateCaptions(imageId: string) {
  const token = await getAuthToken();
  if (!token) return { error: "Not authenticated" as const };

  const resp = await fetch(`${API_BASE}/pipeline/generate-captions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageId }),
  });

  if (!resp.ok) return { error: `Generate captions failed: ${resp.status} ${await readTextSafe(resp)}` as const };
  return { data: await resp.json() }; // array of caption records
}