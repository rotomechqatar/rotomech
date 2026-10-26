import { Buffer } from "buffer";
import {
  githubConfig,
  getJson,
  putFile,
  putJson,
  freePath,
  errorResponse,
} from "@/app/lib/githubContent";

const homepageFilePath = "src/data/homepage.json";
const partnersFilePath = "src/data/products-and-partners.json";

const logoNumber = (str) => Number(/(\d+)(\.webp)?$/.exec(str || "")?.[1] || 0);

export async function POST(req) {
  // Parse form data
  const form = await req.formData();
  const name = form.get("name")?.trim();
  const description = form.get("description")?.trim();
  const logoFile = form.get("file");
  const productFiles = form.getAll("productImages");

  if (!name || !description || !logoFile || productFiles.length === 0) {
    return Response.json(
      { error: "Missing fields or no product images" },
      { status: 400 }
    );
  }
  if (
    logoFile.type !== "image/webp" ||
    productFiles.some((f) => f.type !== "image/webp")
  ) {
    return Response.json({ error: "Only .webp allowed" }, { status: 400 });
  }

  try {
    const cfg = githubConfig();
    const hp = await getJson(cfg, homepageFilePath);
    const pp = await getJson(cfg, partnersFilePath);
    const homepage = hp.data;
    const partnersData = pp.data;
    homepage.partnerLogos = homepage.partnerLogos || {};
    partnersData.partners = partnersData.partners || {};

    // Reject an exact duplicate (same name), e.g. from a double submit
    const sameName = Object.values(partnersData.partners).some(
      (p) => p.name?.trim().toLowerCase() === name.toLowerCase()
    );
    if (sameName) {
      return Response.json(
        { error: `A partner named "${name}" already exists` },
        { status: 409 }
      );
    }

    // Logo number: above every number in use (homepage slots and partner
    // logos), so a new partner never reuses another partner's logo file.
    const used = [
      ...Object.keys(homepage.partnerLogos),
      ...Object.values(homepage.partnerLogos),
      ...Object.values(partnersData.partners).map((p) => p.logo),
    ].map(logoNumber);
    const { path: logoRepoPath, n: idx } = await freePath(
      cfg,
      (n) => `public/logos/partnerLogo${n}.webp`,
      Math.max(0, ...used) + 1
    );
    const logoPath = logoRepoPath.replace(/^public/, "");
    const logoKey = `logo${idx}`;

    await putFile(
      cfg,
      logoRepoPath,
      Buffer.from(await logoFile.arrayBuffer()).toString("base64"),
      `Upload partnerLogo${idx}.webp`
    );

    // Product images get a timestamp so names never collide with old files
    const baseName = name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const stamp = Date.now();
    const imageUrls = [];
    for (let i = 0; i < productFiles.length; i++) {
      const imgFilename = `${baseName}-${stamp}-${i + 1}.webp`;
      await putFile(
        cfg,
        `public/images/products/${imgFilename}`,
        Buffer.from(await productFiles[i].arrayBuffer()).toString("base64"),
        `Upload ${imgFilename}`
      );
      imageUrls.push(`/images/products/${imgFilename}`);
    }

    // Update products-and-partners.json
    const partnerKey = (
      Math.max(0, ...Object.keys(partnersData.partners).map(Number)) + 1
    ).toString();
    const partner = { name, logo: logoPath, description, images: imageUrls };
    partnersData.partners[partnerKey] = partner;
    await putJson(
      cfg,
      partnersFilePath,
      partnersData,
      pp.sha,
      `Add partner ${name}`
    );

    // Update homepage.json (partner logo carousel)
    homepage.partnerLogos[logoKey] = logoPath;
    await putJson(cfg, homepageFilePath, homepage, hp.sha, `Add ${logoKey}`);

    return Response.json({ message: "Partner added", partnerKey, partner });
  } catch (err) {
    return errorResponse(err, "ADD PARTNER");
  }
}
