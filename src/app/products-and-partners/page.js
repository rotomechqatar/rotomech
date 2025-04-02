import Banner from "@/components/Banner";
import ContactForm from "@/components/ContactForm";
import PartnerInfo from "@/components/products-and-partners/PartnerInfo";
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
      <PartnerInfo content={content.partners} />
      <ContactForm page="partners" />
    </section>
  );
}
