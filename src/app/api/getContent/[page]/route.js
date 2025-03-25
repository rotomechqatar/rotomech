import fs from "fs/promises";
import path from "path";

export async function GET(request, { params }) {
  const param = await params;
  const page = param.page;
  const fileName = `${page}.json`;
  const filePath = path.join(process.cwd(), "src/data", fileName);
  try {
    const data = await fs.readFile(filePath, "utf8");
    return new Response(data, { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Unable to read content",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
