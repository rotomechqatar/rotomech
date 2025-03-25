import Banner from "@/components/Banner";
import Jobs from "@/components/careers/Jobs";
import ContactForm from "@/components/ContactForm";
import fs from "fs/promises";
import path from "path";

export default async function page() {
  const filePath = path.join(process.cwd(), "src/data", "careers.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);
  return (
    <div>
      <Banner content={content.banner} />
      <Jobs careers={content.careers} noCareer={content.noJobs} />
      <ContactForm type="careers" />
    </div>
  );
}
