import "server-only";
import { Readable } from "node:stream";
import { getDrive, getDriveFolderId } from "./google";

/** Find or create a sub-folder named for the given record NO. */
async function ensureRecordFolder(no: string): Promise<string> {
  const drive = getDrive();
  const parent = getDriveFolderId();

  const escaped = no.replace(/'/g, "\\'");
  const list = await drive.files.list({
    q: `'${parent}' in parents and name = '${escaped}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id, name)",
    spaces: "drive",
    pageSize: 1,
  });
  const found = list.data.files?.[0];
  if (found?.id) return found.id;

  const created = await drive.files.create({
    requestBody: {
      name: no,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parent],
    },
    fields: "id",
  });
  if (!created.data.id) throw new Error("Gagal membuat folder Drive");
  return created.data.id;
}

export type UploadResult = {
  fileId: string;
  webViewLink: string;
  /** A direct image URL useful for `<img src>` previews. */
  thumbnail: string;
};

/**
 * Upload a single image to Drive under the folder named for the record NO.
 * The file is made readable to anyone with the link so it can be embedded.
 */
export async function uploadPhoto(opts: {
  no: string;
  slug: string;
  buffer: Buffer;
  mimeType: string;
  originalName?: string;
}): Promise<UploadResult> {
  const drive = getDrive();
  const folderId = await ensureRecordFolder(opts.no);

  const ts = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);
  const ext = guessExtension(opts.mimeType, opts.originalName);
  const filename = `${opts.no}_${opts.slug}_${ts}${ext}`;

  const created = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
      mimeType: opts.mimeType,
    },
    media: {
      mimeType: opts.mimeType,
      body: Readable.from(opts.buffer),
    },
    fields: "id, webViewLink",
  });
  const fileId = created.data.id;
  if (!fileId) throw new Error("Drive tidak mengembalikan fileId");

  // Make the file accessible to anyone with the link so the UI can embed it.
  try {
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });
  } catch {
    // ignore permission errors (some workspaces forbid `anyone` sharing)
  }

  return {
    fileId,
    webViewLink:
      created.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`,
    thumbnail: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
  };
}

function guessExtension(mime: string, name?: string): string {
  if (name && /\.[a-z0-9]+$/i.test(name)) {
    return name.slice(name.lastIndexOf("."));
  }
  switch (mime.toLowerCase()) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/heic":
      return ".heic";
    default:
      return "";
  }
}

/**
 * Build a previewable image URL from any value that may be a fileId, share
 * URL, or empty string.
 */
export function photoPreviewUrl(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Already a Drive share URL: extract the fileId.
  const match = trimmed.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  // Looks like a bare fileId.
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) {
    return `https://drive.google.com/thumbnail?id=${trimmed}&sz=w800`;
  }
  // Anything else (http URL, gs://, etc.) — return as-is.
  if (/^https?:\/\//.test(trimmed)) return trimmed;
  return null;
}
