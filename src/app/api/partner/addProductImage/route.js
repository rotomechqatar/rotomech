import { Buffer } from "buffer";
import {
  githubConfig,
  getJson,
  putFile,
  putJson,
  errorResponse,
} from "@/app/lib/githubContent";

const path = "src/data/products-and-partners.json";

export async function POST(req) {
  const form = await req.formData();
  const key = form.get("partnerKey");
  const file = form.get("file");
  if (!key || !file) {
    return Response.json(
      { error: "Missing partnerKey or file" },
      { status: 400 }
    );
  }
  if (file.type !== "image/webp") {
    return Response.json({ error: "Only .webp allowed" }, { status: 400 });
  }

  try {
    const cfg = githubConfig();
    const { sha, data: json } = await getJson(cfg, path);
    const partner = json.partners?.[key];
    if (!partner) {
      return Response.json({ error: "Partner not found" }, { status: 404 });
    }

    // Timestamped name: a count-based name collides with files left over
    // from earlier deletes, and GitHub rejects writes to an existing path
    const base = partner.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const fname = `${base}-${Date.now()}.webp`;
    const webPath = `/images/products/${fname}`;

    await putFile(
      cfg,
      `public${webPath}`,
      Buffer.from(await file.arrayBuffer()).toString("base64"),
      `Add product image ${fname}`
    );

    partner.images = partner.images || [];
    partner.images.push(webPath);
    await putJson(cfg, path, json, sha, `Add image to partner ${key}`);

    return Response.json({ partnerKey: key, imagePath: webPath });
  } catch (err) {
    return errorResponse(err, "ADD PRODUCT IMAGE");
  }
}
