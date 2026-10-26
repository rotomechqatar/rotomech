import {
  githubConfig,
  getJson,
  putJson,
  deleteFile,
  errorResponse,
} from "@/app/lib/githubContent";

const path = "src/data/products-and-partners.json";

export async function DELETE(req) {
  const { partnerKey, imagePath } = await req.json();
  if (!partnerKey || !imagePath) {
    return Response.json(
      { error: "Missing partnerKey or imagePath" },
      { status: 400 }
    );
  }

  try {
    const cfg = githubConfig();
    const { sha, data: json } = await getJson(cfg, path);
    const partner = json.partners?.[partnerKey];
    if (!partner) {
      return Response.json({ error: "Partner not found" }, { status: 404 });
    }

    // Remove it from the JSON first, so a missing file can't block the edit
    partner.images = (partner.images || []).filter((i) => i !== imagePath);
    await putJson(
      cfg,
      path,
      json,
      sha,
      `Remove image from partner ${partnerKey}`
    );

    // Keep the file if another partner still shows it
    const stillUsed = Object.values(json.partners).some((p) =>
      (p.images || []).includes(imagePath)
    );
    const warnings = [];
    if (!stillUsed && imagePath.startsWith("/images/products/")) {
      try {
        await deleteFile(cfg, `public${imagePath}`, `Delete ${imagePath}`);
      } catch (err) {
        console.error("[DELETE PRODUCT IMAGE]", err.message, err.details || "");
        warnings.push(err.message);
      }
    }

    return Response.json({ partnerKey, warnings });
  } catch (err) {
    return errorResponse(err, "DELETE PRODUCT IMAGE");
  }
}
