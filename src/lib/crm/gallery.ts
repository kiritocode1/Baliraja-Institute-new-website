import crypto from "node:crypto";
import { ensureCrmSchema, getSql } from "@/lib/crm/db";
import { readJsonFile, writeJsonFile } from "@/lib/crm/local-store";

export const galleryAlbums = [
  "campus",
  "school",
  "sports",
  "camps",
  "events",
] as const;

export type GalleryAlbum = (typeof galleryAlbums)[number];

export type CrmGalleryImage = {
  id: string;
  url: string;
  caption: string;
  alt: string;
  album: GalleryAlbum;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const GALLERY_FILE = "crm-gallery-images.json";

function parseAlbum(value: unknown): GalleryAlbum {
  const normalized = String(value ?? "").trim();
  return (galleryAlbums as readonly string[]).includes(normalized)
    ? (normalized as GalleryAlbum)
    : "campus";
}

function mapDbImage(row: Record<string, unknown>): CrmGalleryImage {
  return {
    id: String(row.id),
    url: String(row.url),
    caption: String(row.caption),
    alt: String(row.alt),
    album: parseAlbum(row.album),
    sortOrder: Number(row.sort_order ?? 100),
    published: Boolean(row.published),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function listGalleryImages(): Promise<CrmGalleryImage[]> {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    const rows = (await db`
      SELECT
        id, url, caption, alt, album, sort_order, published,
        created_at, updated_at
      FROM crm_gallery_images
      ORDER BY sort_order ASC, created_at DESC
    `) as Record<string, unknown>[];

    return rows.map((row) => mapDbImage(row));
  }

  return (await readJsonFile<CrmGalleryImage[]>(GALLERY_FILE, [])).sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
}

export async function listPublishedGalleryImages(album?: string) {
  return (await listGalleryImages()).filter(
    (image) => image.published && (!album || image.album === album),
  );
}

export async function createGalleryImage(input: {
  url: string;
  caption: string;
  alt: string;
  album: string;
  sortOrder?: number | null;
}): Promise<CrmGalleryImage> {
  const now = new Date().toISOString();
  const image: CrmGalleryImage = {
    id: crypto.randomUUID(),
    url: input.url.trim(),
    caption: input.caption.trim(),
    alt: input.alt.trim() || input.caption.trim(),
    album: parseAlbum(input.album),
    sortOrder: input.sortOrder ?? 100,
    published: true,
    createdAt: now,
    updatedAt: now,
  };

  if (!image.url || !image.caption) {
    throw new Error("Gallery image needs a file and a caption.");
  }

  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      INSERT INTO crm_gallery_images (
        id, url, caption, alt, album, sort_order, published,
        created_at, updated_at
      )
      VALUES (
        ${image.id}, ${image.url}, ${image.caption}, ${image.alt},
        ${image.album}, ${image.sortOrder}, ${image.published},
        ${image.createdAt}, ${image.updatedAt}
      )
    `;
    return image;
  }

  const images = await readJsonFile<CrmGalleryImage[]>(GALLERY_FILE, []);
  images.unshift(image);
  await writeJsonFile(GALLERY_FILE, images);
  return image;
}

export async function updateGalleryImage(
  id: string,
  input: {
    caption: string;
    alt: string;
    album: string;
    sortOrder: number;
    published: boolean;
  },
) {
  const now = new Date().toISOString();
  const album = parseAlbum(input.album);
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`
      UPDATE crm_gallery_images
      SET
        caption = ${input.caption.trim()},
        alt = ${input.alt.trim() || input.caption.trim()},
        album = ${album},
        sort_order = ${input.sortOrder},
        published = ${input.published},
        updated_at = ${now}
      WHERE id = ${id}
    `;
    return;
  }

  const images = await readJsonFile<CrmGalleryImage[]>(GALLERY_FILE, []);
  await writeJsonFile(
    GALLERY_FILE,
    images.map((image) =>
      image.id === id
        ? {
            ...image,
            caption: input.caption.trim(),
            alt: input.alt.trim() || input.caption.trim(),
            album,
            sortOrder: input.sortOrder,
            published: input.published,
            updatedAt: now,
          }
        : image,
    ),
  );
}

export async function deleteGalleryImage(id: string) {
  const ready = await ensureCrmSchema();
  const db = getSql();

  if (ready && db) {
    await db`DELETE FROM crm_gallery_images WHERE id = ${id}`;
    return;
  }

  const images = await readJsonFile<CrmGalleryImage[]>(GALLERY_FILE, []);
  await writeJsonFile(
    GALLERY_FILE,
    images.filter((image) => image.id !== id),
  );
}
