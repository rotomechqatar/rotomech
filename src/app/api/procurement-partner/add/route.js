import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = "src/data/products-and-partners.json";
const LOGO_DIR = "public/logos";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const filename = formData.get("filename"); // keep original name

    /* 1️⃣  save / overwrite image ------------------------------------------------ */
    const arrayBuf = await file.arrayBuffer();
    const logoPath = path.join(process.cwd(), LOGO_DIR, filename);
    await fs.writeFile(logoPath, Buffer.from(arrayBuf));

    /* 2️⃣  load JSON, determine next key ---------------------------------------- */
    const jsonPath = path.join(process.cwd(), DATA_FILE);
    const raw = await fs.readFile(jsonPath, "utf8");
    const obj = JSON.parse(raw);

    if (!obj.procurementPartners) obj.procurementPartners = {};

    /* keep key consistent with filename e.g., procurementPartner4.webp -> logo4 */
    const num =
      filename.match(/(\d+)/)?.[1] ||
      Object.keys(obj.procurementPartners).length + 1;
    const key = `logo${num}`;
    obj.procurementPartners[key] = `/logos/${filename}`;

    /* 3️⃣  persist JSON ---------------------------------------------------------- */
    await fs.writeFile(jsonPath, JSON.stringify(obj, null, 2));

    return Response.json({ key, imagePath: obj.procurementPartners[key] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
