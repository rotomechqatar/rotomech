import MissionAndVision from "@/components/about-us/MissionAndVision";
import PageIntro from "@/components/about-us/PageIntro";
import Banner from "@/components/Banner";
import fs from "fs/promises";
import path from "path";
import CTA from "../../components/about-us/CTA";
import OurValues from "../../components/about-us/OurValues";
import WhyChooseUs from "../../components/about-us/WhyChooseUs";

export default async function page() {
  const filePath = path.join(process.cwd(), "src/data", "about-us.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);

  return (
    <div>
      <Banner content={content.banner} />
      <PageIntro contnet={content.aboutUs} />
      <MissionAndVision
        mission={content.ourMission}
        vision={content.ourVision}
      />
      <OurValues content={content.coreValues} />
      <WhyChooseUs content={content.whyChooseUs} />
      <CTA content={content.cta} />
    </div>
  );
}
