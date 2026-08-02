// Cloudflare Stream API helpers

const STREAM_API = 'https://api.cloudflare.com/client/v4';

interface StreamUploadResponse {
  success: boolean;
  result: {
    uid: string;
    uploadURL: string;
  };
}

interface StreamVideoDetails {
  uid: string;
  status: { state: string };
  duration: number;
  thumbnail: string;
  playback: { hls: string; dash: string };
}

export async function createDirectUpload(
  accountId: string,
  apiToken: string,
  maxDurationSeconds = 7200
): Promise<{ uid: string; uploadURL: string }> {
  const res = await fetch(
    `${STREAM_API}/accounts/${accountId}/stream/direct_upload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxDurationSeconds,
        requireSignedURLs: false,
        allowedOrigins: ['*'],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Stream API error: ${res.status} ${err}`);
  }

  const data: StreamUploadResponse = await res.json();
  if (!data.success) {
    throw new Error('Stream API returned unsuccessful response');
  }

  return { uid: data.result.uid, uploadURL: data.result.uploadURL };
}

export async function getVideoDetails(
  accountId: string,
  apiToken: string,
  uid: string
): Promise<StreamVideoDetails | null> {
  const res = await fetch(
    `${STREAM_API}/accounts/${accountId}/stream/${uid}`,
    {
      headers: { 'Authorization': `Bearer ${apiToken}` },
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}

export function getStreamPlayerUrl(accountId: string, uid: string): string {
  // Use Cloudflare Stream's iframe embed URL
  return `https://customer-${accountId}.cloudflarestream.com/${uid}/iframe`;
}

export function getStreamThumbnailUrl(uid: string): string {
  return `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg`;
}
