import { randomUUID } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Vercel rejects request bodies over 4.5 MB, so keep CVs under that.
const MAX_SIZE = 4 * 1024 * 1024;

const ALLOWED_TYPES = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const json = (body, status) => Response.json(body, { status });

// Keeps only letters and numbers, for use in the file name.
const sanitize = (str) => String(str || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 50);

export async function POST(request) {
  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: "Expected a multipart form upload." }, 400);
  }

  try {
    const file = formData.get("file");
    const name = sanitize(formData.get("name")) || "applicant";

    if (!file || typeof file === "string") {
      return json({ error: "No file provided." }, 400);
    }
    if (file.size > MAX_SIZE) {
      return json({ error: "File is too large. Maximum size is 4 MB." }, 413);
    }

    const ext = file.name.split(".").pop().toLowerCase();
    const contentType = ALLOWED_TYPES[ext];
    if (!contentType) {
      return json({ error: "Only PDF, DOC and DOCX files are allowed." }, 400);
    }

    // The random part keeps the public link from being guessed.
    const timestamp = new Date().toISOString().split(".")[0].replace(/:/g, "-");
    const key = `cv/${name}_${timestamp}_${randomUUID()}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        Body: Buffer.from(await file.arrayBuffer()),
        ContentType: contentType,
      })
    );

    const publicUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
    return json({ url: `${publicUrl}/${key}` }, 200);
  } catch (error) {
    console.error("[UPLOAD CV] Error:", error);
    return json({ error: "Upload failed." }, 500);
  }
}
