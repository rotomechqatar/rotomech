import fs from "fs/promises";
import path from "path";
import Banner from "@/components/Banner";
import OurLegacy from "@/components/home/OurLegacy";
import DirectorMessage from "@/components/home/DirectorMessage";
import CtaSection from "@/components/CTA/CTASection";
import PartnerSection from "@/components/home/PartnerSection";
import ClientSection from "@/components/home/ClientSection";

export default async function HomePage() {
  const filePath = path.join(process.cwd(), "src/data", "homepage.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);

  return (
    <div>
      <Banner content={content.banner} btn={true} />
      <PartnerSection content={content.partnerLogos} />
      <OurLegacy content={content.ourLegacy} />
      <ClientSection clientData={content.clientData} />
      <DirectorMessage content={content.directorMessage} />
      <CtaSection content={content.CTA} />
    </div>
  );
}
