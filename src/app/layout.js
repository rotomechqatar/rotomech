import Footer from "@/components/footer/Footer";
import "./globals.css";
import Header from "@/components/header/Header";
import Head from "next/head";
import fs from "fs/promises";
import path from "path";

export async function generateMetadata() {
  const filePath = path.join(process.cwd(), "src/data", "homepage.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);

  return {
    title: content.meta.title,
    description: content.meta.description,
    keywords: content.meta.keywords,
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      url: `https: //www.rotomech.qa`,
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
    },
  };
}

export default async function RootLayout({ children }) {
  const filePath = path.join(process.cwd(), "src/data", "homepage.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);

  // Call generateMetadata and store its result
  const metadata = await generateMetadata();
  console.log(metadata);

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

  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={metadata.keywords.join(", ")} />
        <meta property="og:title" content={metadata.openGraph.title} />
        <meta
          property="og:description"
          content={metadata.openGraph.description}
        />
        <meta property="og:url" content={metadata.openGraph.url} />
        <meta property="og:site_name" content={metadata.openGraph.siteName} />
        <meta name="twitter:card" content={metadata.twitter.card} />
        <meta name="twitter:title" content={metadata.twitter.title} />
        <meta
          name="twitter:description"
          content={metadata.twitter.description}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
