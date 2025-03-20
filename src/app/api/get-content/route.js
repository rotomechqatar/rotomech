// app/api/getContent/route.js
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const filePath = path.join(process.cwd(), "src/data", "homePageContent.json");
  try {
    const data = await fs.readFile(filePath, "utf8");
    return new Response(data, { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Unable to read content" }), {
      status: 500,
    });
  }
}
