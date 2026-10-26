import {
  githubConfig,
  getJson,
  putJson,
  deleteFile,
  errorResponse,
} from "@/app/lib/githubContent";

const homepageFilePath = "src/data/homepage.json";
const partnersFilePath = "src/data/products-and-partners.json";

export async function DELETE(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  let partnerKey = body.key != null ? String(body.key) : "";
  if (!partnerKey) {
    return Response.json({ error: "Missing or invalid key" }, { status: 400 });
  }

  try {
    const cfg = githubConfig();
    const pp = await getJson(cfg, partnersFilePath);
    const partnersData = pp.data;
    let partner = partnersData.partners?.[partnerKey];

    // The homepage editor identifies a partner by its logo slot ("logo3"), so
    // resolve that to the partner record using the same logo
    if (!partner && /^logo\d+$/.test(partnerKey)) {
      const hp = await getJson(cfg, homepageFilePath);
      const logoPath = hp.data.partnerLogos?.[partnerKey];
      const match = Object.entries(partnersData.partners || {}).find(
        ([, p]) => logoPath && p.logo === logoPath
      );
      if (match) [partnerKey, partner] = match;
    }

    if (!partner) {
      return Response.json({ error: "Partner not found" }, { status: 404 });
    }

    // Remove the partner record first: that is what the site renders from
    delete partnersData.partners[partnerKey];
    await putJson(
      cfg,
      partnersFilePath,
      partnersData,
      pp.sha,
      `Remove partner ${partnerKey} (${partner.name})`
    );

    // Files still referenced by another partner must be kept
    const remaining = Object.values(partnersData.partners);
    const logoShared = remaining.some((p) => p.logo === partner.logo);
    const stillUsed = new Set(remaining.flatMap((p) => p.images || []));

    // The homepage carousel slot is found by its path, not by the partner key
    if (partner.logo && !logoShared) {
      const hp = await getJson(cfg, homepageFilePath);
      const logos = hp.data.partnerLogos || {};
      const slots = Object.keys(logos).filter((k) => logos[k] === partner.logo);
      if (slots.length) {
        slots.forEach((k) => delete logos[k]);
        await putJson(
          cfg,
          homepageFilePath,
          hp.data,
          hp.sha,
          `Remove partner ${slots.join(", ")}`
        );
      }
    }

    // A failed file delete leaves an orphan file, not broken content,
    // so report it instead of failing the whole request
    const warnings = [];
    const files = [
      ...(partner.logo && !logoShared ? [partner.logo] : []),
      ...(partner.images || []).filter((img) => !stillUsed.has(img)),
    ];
    for (const file of new Set(files)) {
      try {
        await deleteFile(cfg, `public${file}`, `Delete ${file}`);
      } catch (err) {
        console.error("[DELETE PARTNER]", err.message, err.details || "");
        warnings.push(err.message);
      }
    }

    return Response.json({
      message: "Partner deleted",
      key: partnerKey,
      warnings,
    });
  } catch (err) {
    return errorResponse(err, "DELETE PARTNER");
  }
}
