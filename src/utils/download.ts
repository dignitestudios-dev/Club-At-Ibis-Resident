/** Saves a file under `filename` instead of opening it in a tab. */
function saveBlobUrl(href: string, filename: string, newTab = false) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  if (newTab) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Downloads a file from a (storage) URL. A cross-origin link ignores the `download` attribute and just opens
 * the file, so the bytes are fetched and saved from a local blob URL instead. If the fetch is blocked
 * (CORS), it falls back to opening the link so the file is still reachable.
 */
export async function downloadFromUrl(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed (${response.status})`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    saveBlobUrl(objectUrl, filename);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    saveBlobUrl(url, filename, true);
  }
}
