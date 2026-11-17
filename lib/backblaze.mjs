import "server-only";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import { backblazeConfig } from "./service-config.mjs";

let client;

export function getBackblazeClient() {
  if (!client) {
    const { bucket, ...config } = backblazeConfig();
    client = new S3Client({
      ...config,
      forcePathStyle: true,
      maxAttempts: 2,
      requestHandler: { connectionTimeout: 5000, requestTimeout: 10000 },
    });
  }
  return client;
}

export async function checkBackblazeBucket() {
  const { bucket } = backblazeConfig();
  await getBackblazeClient().send(new HeadBucketCommand({ Bucket: bucket }), {
    abortSignal: AbortSignal.timeout(15000),
  });
}

export function closeBackblazeClient() {
  client?.destroy();
  client = undefined;
}
