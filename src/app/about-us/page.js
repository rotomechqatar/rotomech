import PageIntro from "@/components/about-us/PageIntro";
import Banner from "@/components/Banner";
import fs from "fs/promises";
import path from "path";

export default async function page() {
  const filePath = path.join(process.cwd(), "src/data", "about-us.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);
  return (
    <div>
      <Banner content={content.banner} />
      <PageIntro contnet={content.aboutUs} />
    </div>
  );
}
