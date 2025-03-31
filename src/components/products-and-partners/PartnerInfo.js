"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../Button";

export default function PartnerInfiniteCarousel({ content }) {
  // Assume content has at least three items.
  const [visibleLogos, setVisibleLogos] = useState(content.slice(0, 3));
  // nextIndex points to the next logo in the array (cyclically)
  const [nextIndex, setNextIndex] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      const newLogo = content[nextIndex % content.length];
      // New visible logos: new logo enters at top, previous top becomes middle, previous middle becomes bottom.
      setVisibleLogos((prev) => [newLogo, prev[0], prev[1]]);
      setNextIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, [content, nextIndex]);

  return (
    <>
      <section className="flex px-[15rem] py-[5rem] h-[80vh] overflow-hidden gap-[2rem]">
        {/* Left Logos Carousel */}
        <div className="w-[30%] relative h-full overflow-hidden border py-auto rounded-[25px]">
          <AnimatePresence>
            {visibleLogos.map((item, i) => (
              <motion.div
                key={item.name} // assuming name is unique
                // Positions are computed relative to center: (i - 1) * 150
                // For i = 0 (new top logo): initial starts further up at -300.
                initial={{ y: i === 0 ? -300 : (i - 1) * 150, scale: 1 }}
                animate={{ y: (i - 1) * 150, scale: i === 1 ? 1.15 : 1 }}
                exit={{ y: i === 2 ? 300 : (i - 1) * 150, scale: 1 }}
                transition={{ duration: 1, ease: "linear" }}
                className="absolute w-full h-[8rem] flex justify-center items-center"
                style={{ top: "calc(50% - 4rem)" }}
              >
                {i === 1 ? (
                  // Center logo: wrap in a container that has an animated gradient border.
                  <div className="gradient-border rounded-[25px] ">
                    <div className="relative w-[12rem] h-[10rem] scale-155">
                      <Image
                        src={item.logo}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-[12rem] h-[10rem]">
                    <Image
                      src={item.logo}
                      alt={item.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Right Text Info */}
        <div className="w-[70%] flex flex-col justify-center overflow-hidden border px-[5rem] py-[5rem] rounded-[25px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={visibleLogos[1].name} // Display the middle item as active detail.
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 1, ease: "linear" }}
            >
              <h2 className="text-[4rem] font-bold mb-4">
                {visibleLogos[1].name}
              </h2>
              <p className="mb-[2rem] text-[1.6rem] text-justify">
                {visibleLogos[1].description}
              </p>
              <a
                href={visibleLogos[1].link}
                className="text-blue hover:underline font-medium text-[2rem]"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button text="Visit" />
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Gradient border CSS */}
      <style jsx>{`
        .gradient-border {
          position: relative;
          border: 1px solid transparent;
          height: 17rem;
          width: 20rem;
          border-radius: 25px;
          background: linear-gradient(90deg, #3b82f6, #10b981, #3b82f6);
          background-size: 200%;
          animation: gradient-animation 5s linear infinite;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .gradient-border > div {
          background: white; /* or whatever background is desired */
          border-radius: 25px;
          padding: 3rem 8rem;
        }
        @keyframes gradient-animation {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </>
  );
}
