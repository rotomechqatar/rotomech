"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function BannerBackground({ content }) {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{
          duration: 20,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <Image
          src={content.image}
          alt={content.alt}
          fill
          className="object-cover object-center"
        />
      </motion.div>
    </div>
  );
}
