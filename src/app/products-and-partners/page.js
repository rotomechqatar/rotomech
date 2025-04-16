import Banner from "@/components/Banner";
import PartnerSection from "@/components/home/PartnerSection";
import PartnerInfo from "@/components/products-and-partners/PartnerInfo";
import ProductData from "@/components/products-and-partners/ProductData";
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
      <PartnerSection
        content={content.procurementPartners}
        type="procurement"
      />
      <ProductData content={content.partners} />
    </section>
  );
}
