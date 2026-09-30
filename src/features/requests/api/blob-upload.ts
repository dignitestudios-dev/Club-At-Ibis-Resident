/**
 * Direct browser -> Azure Blob upload. Must NOT go through the app's
 * axiosInstance: the SAS URL already carries its own authorization in the
 * query string, so no Bearer token should be attached, and axios's global
 * JSON content-type / 401/403/5xx interceptors don't apply to Azure's
 * response. Plain fetch with exactly the headers the backend returned.
 */
export async function putFileToBlob(
  uploadUrl: string,
  file: File,
  requiredHeaders: Record<string, string>
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: requiredHeaders,
    body: file,
  });
  if (!response.ok) {
    throw new Error(`Upload to storage failed (${response.status})`);
  }
}
