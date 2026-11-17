import "server-only";

export class ConfigurationError extends Error {}

function required(env, name) {
  const value = env[name]?.trim();
  if (!value) throw new ConfigurationError(`Set ${name} in .env.`);
  return value;
}

export function mongodbConfig(env = process.env) {
  const uri = required(env, "MONGODB_URI");
  if (!/^mongodb(?:\+srv)?:\/\//.test(uri)) {
    throw new ConfigurationError("MONGODB_URI must be a MongoDB connection string.");
  }
  const database = required(env, "MONGODB_DB");
  if (/[\s/\\.\"$\0]/.test(database)) {
    throw new ConfigurationError("MONGODB_DB contains an invalid database name character.");
  }
  return { uri, database };
}

export function backblazeConfig(env = process.env) {
  const endpoint = required(env, "B2_S3_ENDPOINT");
  const region = required(env, "B2_S3_REGION");
  let parsed;
  try {
    parsed = new URL(endpoint);
  } catch {
    throw new ConfigurationError("B2_S3_ENDPOINT must be a valid HTTPS URL.");
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.hostname !== `s3.${region}.backblazeb2.com` ||
    parsed.port || parsed.username || parsed.password ||
    parsed.search || parsed.hash || parsed.pathname !== "/"
  ) {
    throw new ConfigurationError(
      "B2_S3_ENDPOINT must be https://s3.<B2_S3_REGION>.backblazeb2.com without a bucket path.",
    );
  }
  return {
    endpoint: parsed.origin,
    region,
    bucket: required(env, "B2_BUCKET_NAME"),
    credentials: {
      accessKeyId: required(env, "B2_APPLICATION_KEY_ID"),
      secretAccessKey: required(env, "B2_APPLICATION_KEY"),
    },
  };
}
