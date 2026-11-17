import nextEnv from "@next/env";
import { fileURLToPath } from "node:url";
import { ConfigurationError } from "../lib/service-config.mjs";
import { getDatabase, closeMongoClient } from "../lib/mongodb.mjs";
import { checkBackblazeBucket, closeBackblazeClient } from "../lib/backblaze.mjs";

// Match Next.js development env precedence, including .env.local overrides.
// Suppress loader diagnostics so malformed env files cannot expose values.
nextEnv.loadEnvConfig(fileURLToPath(new URL("../", import.meta.url)), true, {
  info() {}, error() {},
});

function failureMessage(error, service) {
  if (error instanceof ConfigurationError) return error.message;
  if (service === "MongoDB") {
    if (error.code === 18) return "Authentication failed. Check the database username/password and authSource.";
    return "Connection/ping failed. Check the URI, Atlas network access, DNS, and database user permissions.";
  }
  const status = error.$metadata?.httpStatusCode;
  if (status === 403) return "Access denied (403). Check the application key and bucket permissions, including listBuckets.";
  if (status === 404) return "Bucket not found (404). Check the bucket name and endpoint region.";
  return "Bucket check failed. Check the endpoint, region, application key, network access, and timeout.";
}

try {
  const checks = [
    { name: "MongoDB", run: async () => {
      await (await getDatabase()).command({ ping: 1 });
      return "connected; ping succeeded";
    } },
    { name: "Backblaze B2", run: async () => {
      await checkBackblazeBucket();
      return "bucket accessible; signed HeadBucket succeeded";
    } },
  ];
  const results = await Promise.allSettled(checks.map((check) => check.run()));
  results.forEach((result, index) => {
    const { name } = checks[index];
    if (result.status === "fulfilled") console.log(`PASS ${name}: ${result.value}.`);
    else {
      // Do not print raw driver errors: they can contain connection details.
      console.error(`FAIL ${name}: ${failureMessage(result.reason, name)}`);
      process.exitCode = 1;
    }
  });
  console.log("Read-only check: no records, collections, buckets, or objects were created or modified.");
} finally {
  await closeMongoClient();
  closeBackblazeClient();
}
