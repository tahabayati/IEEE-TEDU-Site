import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getBackblazeClient } from "../../../lib/backblaze.mjs";
import { backblazeConfig } from "../../../lib/service-config.mjs";

// Serves files from the private B2 bucket. Keys are content-hashed, so a key's bytes never
// change and the response can be cached forever by browsers and the Vercel CDN.
const ALLOWED = /^team\/[a-f0-9]{64}\.webp$/;

export async function GET(_request, { params }) {
  const key = (await params).key.join("/");
  if (!ALLOWED.test(key)) return new Response("Not found", { status: 404 });
  try {
    const object = await getBackblazeClient().send(
      new GetObjectCommand({ Bucket: backblazeConfig().bucket, Key: key }),
    );
    return new Response(object.Body.transformToWebStream(), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch (error) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) {
      return new Response("Not found", { status: 404 });
    }
    throw error;
  }
}
