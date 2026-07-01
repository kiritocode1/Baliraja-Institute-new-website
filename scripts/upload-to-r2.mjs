import fs from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Helper to manually load .env file if it exists, since this runs outside Next.js process
const loadEnv = () => {
  if (fs.existsSync(".env")) {
    const content = fs.readFileSync(".env", "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)?$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  }
};

loadEnv();

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
} = process.env;

if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  console.error("Error: Missing R2 environment variables.");
  console.error(
    "Please ensure the following variables are defined in your .env file:",
  );
  console.error("  R2_ACCOUNT_ID");
  console.error("  R2_ACCESS_KEY_ID");
  console.error("  R2_SECRET_ACCESS_KEY");
  console.error("  R2_BUCKET_NAME");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".mp4":
      return "video/mp4";
    case ".mov":
      return "video/quicktime";
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
};

const uploadFile = async (filePath, key) => {
  const fileStream = fs.createReadStream(filePath);
  const contentType = getContentType(filePath);

  console.log(
    `Uploading ${filePath} to bucket as '${key}' (${contentType})...`,
  );

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
  });

  try {
    await s3.send(command);
    console.log(`Successfully uploaded '${key}'`);
  } catch (err) {
    console.error(`Error uploading '${key}':`, err);
  }
};

const main = async () => {
  const dirPath = path.join(process.cwd(), "public", "home");
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory ${dirPath} does not exist.`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const key = `home/${file}`;
      await uploadFile(filePath, key);
    }
  }
  console.log("Upload job finished.");
};

main();
