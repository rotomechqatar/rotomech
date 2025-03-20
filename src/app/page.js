import fs from "fs/promises";
import path from "path";
import Banner from "@/components/home/Banner";
import OurLegacy from "@/components/home/OurLegacy";
import DirectorMessage from "@/components/home/DirectorMessage";

export default async function HomePage() {
  const filePath = path.join(process.cwd(), "src/data", "homepage.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);

  return (
    <div>
      <Banner content={content.banner} />
      <OurLegacy content={content.ourLegacy} />
      <DirectorMessage content={content.directorMessage} />
    </div>
  );
}
