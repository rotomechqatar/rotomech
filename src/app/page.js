import Image from "next/image";
import fs from "fs/promises";
import path from "path";

export default async function HomePage() {
  const filePath = path.join(process.cwd(), "src/data", "homepage.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);

  return <h2>Testing</h2>;
}
