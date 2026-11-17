import "server-only";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getBackblazeClient } from "./backblaze.mjs";
import { backblazeConfig } from "./service-config.mjs";

export const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024;

// Crops to width x height WebP and uploads under a content-hashed key (what /media/[...key] serves).
// prefix must be one of the folders the media route allows. Returns the key; throws if not an image.
export async function uploadImage(file, { prefix, width, height }) {
  const webp = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate().resize(width, height, { fit: "cover" }).webp({ quality: 80 }).toBuffer();
  const key = `${prefix}/${createHash("sha256").update(webp).digest("hex")}.webp`;
  await getBackblazeClient().send(new PutObjectCommand({
    Bucket: backblazeConfig().bucket, Key: key, Body: webp, ContentType: "image/webp",
  }));
  return key;
}
