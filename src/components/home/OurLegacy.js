import OurLegacyImages from "./OurLegacyImages";

export default function OurLegacy({ content }) {
  // Prepare image data for the client component.
  const images = [
    { src: content.image1, alt: content.alt1, position: "top-left" },
    { src: content.image2, alt: content.alt2, position: "center" },
    { src: content.image3, alt: content.alt3, position: "bottom-left" },
    { src: content.image4, alt: content.alt4, position: "top-right" },
    { src: content.image5, alt: content.alt5, position: "bottom-right" },
  ];

  return (
    <div className="flex w-full min-h-[80vh] px-[15rem] py-[10rem]">
      {/* Left Half: Image Carousel handled by the client component */}
      <OurLegacyImages images={images} />

      {/* Right Half: Text Content (rendered on the server) */}
      <div className="w-1/2 p-8 flex flex-col justify-center">
        <h2 className="text-[5rem]">{content.head}</h2>
        <p className="text-[2rem] text-justify">{content.text}</p>
      </div>
    </div>
  );
}
