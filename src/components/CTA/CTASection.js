"use client";

import Link from "next/link";
import LottieAnimation from "../LottieAnimation";
import Button from "../Button";
import { motion } from "framer-motion";
import animationData from "@/animations/oil-and-gas.json";

const revealItem = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const revealContainer = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

export default function CtaSection({ content }) {
  return (
    <section className="h-[80vh] flex justify-between items-center gap-[2rem] px-[15rem] my-[5rem]  max-11xl:px-[10rem] max-8xl:flex-col max-8xl:px-[5rem]">
      {/* Left Side: Text */}
      <motion.div
        variants={revealContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="w-[50%] max-8xl:w-[100%]"
      >
        <motion.h2
          variants={revealItem}
          className="text-[5rem] font-bold mb-[3rem]"
        >
          {content.head}
        </motion.h2>
        <motion.p
          variants={revealItem}
          className="text-[2rem] mb-[5rem] w-[80%] max-6xl:w-[100%]"
        >
          {content.text}
        </motion.p>
        <Link href="/contact">
          <Button text="Contact Us" textSize="3rem" />
        </Link>
      </motion.div>

      {/* Right Side: Lottie Animation */}
      <div className="w-[50%] max-8xl:w-[70%] max-6xl:w-[100%]">
        <LottieAnimation animationData={animationData} />
      </div>
    </section>
  );
}
