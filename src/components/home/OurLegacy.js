"use client";
import { motion } from "framer-motion";
import OurLegacyImages from "./OurLegacyImages";

// Container to stagger the appearance of each chunk
const revealContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Each chunk will fade in and slide up slightly
const revealItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function OurLegacy({ content }) {
  // Prepare image data for the client component.
  const images = [
    { src: content.image1, alt: content.alt1, position: "top-left" },
    { src: content.image2, alt: content.alt2, position: "center" },
    { src: content.image3, alt: content.alt3, position: "bottom-left" },
    { src: content.image4, alt: content.alt4, position: "top-right" },
    { src: content.image5, alt: content.alt5, position: "bottom-right" },
  ];

  // Split the text into words and then group them in chunks of 10 words each.
  const words = content.text.split(" ");
  const chunkSize = 10;
  const textChunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    // Join the words back into a string and add a space at the end.
    const chunk = words.slice(i, i + chunkSize).join(" ") + " ";
    textChunks.push(chunk);
  }

  return (
    <section className="flex w-full min-h-[80vh] px-[15rem] py-[10rem] max-15xl:px-[10rem]  max-9xl:flex-col max-6xl:px-[5rem]">
      {/* Left Half: Image Carousel */}
      <OurLegacyImages images={images} />

      {/* Right Half: Text Content with inline animated text chunks */}
      <motion.div
        className="w-1/2 max-9xl:w-full p-8 flex flex-col justify-center"
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2 variants={revealItem} className="text-[5rem]">
          {content.head}
        </motion.h2>
        <p className="text-[2rem] text-justify mt-4">
          {textChunks.map((chunk, index) => (
            <motion.span
              key={index}
              variants={revealItem}
              // style={{ display: "inline-block" }}
            >
              {chunk}
            </motion.span>
          ))}
        </p>
      </motion.div>
    </section>
  );
}
