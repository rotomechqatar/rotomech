import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = "src/data/products-and-partners.json";
const PUBLIC = "public";

export async function DELETE(req) {
  try {
    const { key } = await req.json();
    if (!key) return Response.json({ error: "Missing key" }, { status: 400 });

    /* 1️⃣  read JSON, locate logo path ------------------------------------------ */
    const jsonPath = path.join(process.cwd(), DATA_FILE);
    const raw = await fs.readFile(jsonPath, "utf8");
    const obj = JSON.parse(raw);

    const logoPath = obj.procurementPartners?.[key];
    if (!logoPath)
      return Response.json({ error: "Key not found" }, { status: 404 });

    /* 2️⃣  delete image file ----------------------------------------------------- */
    const filePath = path.join(process.cwd(), PUBLIC, logoPath);
    try {
      await fs.unlink(filePath);
    } catch {} // ignore if missing

    /* 3️⃣  remove key & save JSON ------------------------------------------------ */
    delete obj.procurementPartners[key];
    await fs.writeFile(jsonPath, JSON.stringify(obj, null, 2));

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
