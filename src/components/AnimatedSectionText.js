"use client";
import { motion } from "framer-motion";

// Variants for container and each item
const revealContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const revealItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

const AnimatedSectionText = ({ heading, paragraphs, chunkSize = 10 }) => {
  return (
    <motion.div
      className="animated-text"
      variants={revealContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {heading && (
        <motion.h2 variants={revealItem} className="text-[5rem]">
          {heading}
        </motion.h2>
      )}

      {paragraphs.map((para, index) => {
        // Split the paragraph text into words and then create chunks.
        const words = para.split(" ");
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join(" ") + " ";
          chunks.push(chunk);
        }

        return (
          <p key={index} className="text-[2rem] text-justify mt-4">
            {chunks.map((chunk, idx) => (
              <motion.span key={idx} variants={revealItem}>
                {chunk}
              </motion.span>
            ))}
          </p>
        );
      })}
    </motion.div>
  );
};

export default AnimatedSectionText;
