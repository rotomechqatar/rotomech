import fs from "fs/promises";
import path from "path";

export async function GET(request, { params }) {
  console.log("GET request received for getContent API. Params:", params);
  const page = params.page;
  const fileName = `${page}.json`;
  const filePath = path.join(process.cwd(), "src/data", fileName);
  console.log("Computed filePath:", filePath);
  try {
    const data = await fs.readFile(filePath, "utf8");
    console.log("Successfully read file:", fileName);
    return new Response(data, { status: 200 });
  } catch (error) {
    console.error("Error reading file:", error);
    return new Response(
      JSON.stringify({
        error: "Unable to read content",
        details: error.message,
      }),
      { status: 500 }
    );
  }
}
