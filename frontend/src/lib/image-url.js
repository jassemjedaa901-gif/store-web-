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

  // Local static paths are allowed (/products/... or /placeholder.svg)
  if (raw.startsWith("/")) {
    return { ok: true, url: raw, reason: "local_path" };
  }

  // Remote URLs must look like direct image files.
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, url: raw, reason: "invalid_url" };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { ok: false, url: raw, reason: "invalid_protocol" };
  }

  const path = parsed.pathname.toLowerCase();
  const isDirectImagePath = /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i.test(path);
  const looksLikeDriveDirect = parsed.hostname.includes("drive.google.com") && parsed.pathname.includes("/uc");

  if (!isDirectImagePath && !looksLikeDriveDirect) {
    return { ok: false, url: raw, reason: "non_direct_image_url" };
  }

  return { ok: true, url: raw, reason: "as_is" };
}

