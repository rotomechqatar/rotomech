import fs from "fs/promises";
import path from "path";

export async function generateMetadata() {
  const filePath = path.join(process.cwd(), "src/data", "about-us.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);

  return {
    title: content.meta.title,
    description: content.meta.description,
    keywords: content.meta.keywords,
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      url: `https://www.rotomech.qa/about-us`,
      siteName: "Rotomech Qatar",
      locale: "en_QA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.description,
    },
  };
}

export default function RootLayout({ children }) {
  return <body>{children}</body>;
}
