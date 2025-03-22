"use client";
import OurLegacyImages from "./OurLegacyImages";
import AnimatedSectionText from "../AnimatedSectionText";

export default function OurLegacy({ content }) {
  const images = [
    { src: content.image1, alt: content.alt1, position: "top-left" },
    { src: content.image2, alt: content.alt2, position: "center" },
    { src: content.image3, alt: content.alt3, position: "bottom-left" },
    { src: content.image4, alt: content.alt4, position: "top-right" },
    { src: content.image5, alt: content.alt5, position: "bottom-right" },
  ];

  return (
    <section className="flex w-full min-h-[80vh] px-[15rem] py-[5rem] max-15xl:px-[10rem]  max-9xl:flex-col max-6xl:px-[5rem]">
      <OurLegacyImages images={images} />

      <div className="w-1/2 max-9xl:w-full p-8 flex flex-col justify-center">
        <AnimatedSectionText
          heading={content.head}
          paragraphs={[content.text]}
        />
      </div>
    </section>
  );
}
