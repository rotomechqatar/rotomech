import Banner from "@/components/Banner";
import ContactForm from "@/components/ContactForm";
import Location from "@/components/contact-us/Location";
import PageIntro from "@/components/contact-us/PageIntro";
import fs from "fs/promises";
import path from "path";

export default async function page() {
  const filePath = path.join(process.cwd(), "src/data", "contact-us.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);
  return (
    <div>
      <Banner content={content.banner} />
      <PageIntro content={content} />
      <Location content={content} />
      <ContactForm content={content.images} type="contact" />
    </div>
  );
}
