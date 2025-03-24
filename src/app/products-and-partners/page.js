import Banner from "@/components/Banner";
import fs from "fs/promises";
import path from "path";

export default async function page() {
  const filePath = path.join(
    process.cwd(),
    "src/data",
    "products-and-partners.json"
  );
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);
  return (
    <section>
      <Banner content={content.banner} />
    </section>
  );
}
