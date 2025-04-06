import Footer from "@/components/footer/Footer";
import "./globals.css";
import Header from "@/components/header/Header";
import fs from "fs/promises";
import path from "path";

export async function generateMetadata() {
  const filePath = path.join(process.cwd(), "src/data", "homepage.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Rotomech Qatar",
    url: "https://www.rotomech.qa",
    identifier: "Rotomech - Doha, Qatar",
    creator: {
      "@type": "Person",
      name: "Melvin Prince",
      url: "https://www.melvinprince.io",
    },
    sameAs: [
      "https://github.com/melvinprince",
      "https://www.linkedin.com/in/melvinprince/",
    ],
  };

  return {
    title: content.meta.title,
    description: content.meta.description,
    keywords: content.meta.keywords,
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      url: "https://www.rotomech.qa",
      siteName: "Rotomech Qatar",
      locale: "en_QA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.description,
    },
    other: {
      "digital-signature": content.meta.sign,
      "hidden-backlink": content.meta.CURL,
      "application/ld+json": JSON.stringify(jsonLd),
    },
  };
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
