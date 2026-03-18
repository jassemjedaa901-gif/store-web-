export function normalizeImageUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return { ok: false, url: "", reason: "empty" };

  // Google Images result pages are not direct image URLs
  if (raw.includes("google.com/imgres") || raw.includes("google.tld/imgres")) {
    return { ok: false, url: raw, reason: "google_imgres" };
  }

  // Google Drive share links -> direct view
  // Example: https://drive.google.com/file/d/<id>/view?...
  const driveMatch = raw.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (driveMatch) {
    const id = driveMatch[1];
    return { ok: true, url: `https://drive.google.com/uc?export=view&id=${id}`, reason: "drive_converted" };
  }

  // Google Drive open?id=<id>
  const openId = raw.match(/drive\.google\.com\/open\?id=([^&]+)/i);
  if (openId) {
    const id = openId[1];
    return { ok: true, url: `https://drive.google.com/uc?export=view&id=${id}`, reason: "drive_converted" };
  }

  // Already looks like a direct image URL or local path (/products/...)
  return { ok: true, url: raw, reason: "as_is" };
}

