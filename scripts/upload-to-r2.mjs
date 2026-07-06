import fs from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const loadEnv = () => {
  if (!fs.existsSync(".env")) return;

  const content = fs.readFileSync(".env", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)?$/);
    if (!match) continue;

    const key = match[1];
    let val = match[2] || "";
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
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
  console.error("Error: Missing Cloudflare R2 environment variables.");
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
  endpoint: `https://${R2_ACCOUNT_ID.trim()}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: R2_SECRET_ACCESS_KEY.trim(),
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
  const fileBuffer = fs.readFileSync(filePath);
  const contentType = getContentType(filePath);

  console.log(
    `Uploading ${filePath} to Cloudflare R2 bucket as '${key}' (${contentType})...`,
  );

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME.trim(),
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  try {
    await s3.send(command);
    console.log(`Successfully uploaded '${key}'`);
  } catch (err) {
    console.error(`Error uploading '${key}':`, err);
  }
};

const walkDir = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
};

const main = async () => {
  console.log("Using Cloudflare R2 bucket configuration...");
  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    console.error(`Directory ${publicDir} does not exist.`);
    return;
  }

  console.log("Scanning public directory recursively for assets...");
  const allFiles = walkDir(publicDir);
  console.log(`Found ${allFiles.length} files to process.`);

  for (const filePath of allFiles) {
    const relativePath = path.relative(publicDir, filePath);
    const key = relativePath.replace(/\\/g, "/");

    if (
      key === "favicon.ico" ||
      key === "manifest.webmanifest" ||
      key === "robots.txt" ||
      key.includes(".DS_Store")
    ) {
      console.log(`Skipping system file: ${key}`);
      continue;
    }

    await uploadFile(filePath, key);
  }
  console.log("Upload job finished successfully.");
};

main().catch((error) => {
  console.error("R2 upload failed:", error);
  process.exit(1);
});