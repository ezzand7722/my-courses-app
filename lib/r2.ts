// R2 upload helpers using presigned URLs via Cloudflare API
// In production, R2 binding is accessed server-side

export async function uploadToR2(
  file: File | Blob,
  key: string,
  contentType: string,
  bucket: string,
  accountId: string,
  accessKeyId: string,
  secretAccessKey: string
): Promise<string> {
  // Use S3-compatible API endpoint for R2
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  
  // For simplicity, we'll use a direct upload via the API
  // In production, use @aws-sdk/client-s3 with R2's S3 compatibility
  const url = `${endpoint}/${bucket}/${key}`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      'x-amz-acl': 'public-read',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`R2 upload failed: ${response.status}`);
  }

  return `${endpoint}/${bucket}/${key}`;
}

export function getPublicR2Url(key: string, customDomain?: string): string {
  if (customDomain) return `https://${customDomain}/${key}`;
  return `/api/images/${key}`;
}
