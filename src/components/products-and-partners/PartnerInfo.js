"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// The three carousel slots (top, centre, bottom) for the partner at `index`.
// With fewer than three partners a slot that would repeat a partner already
// shown is left empty (null), so the section works for any partner count.
function windowAt(items, index) {
  const n = items.length;
  const at = (i) => items[((i % n) + n) % n];
  const center = at(index);
  const top = n > 1 ? at(index + 1) : null;
  const bottom = n > 2 ? at(index - 1) : null;
  return [top, center, bottom];
}

export default function PartnerInfiniteCarousel({ content }) {
  // Convert content to an array, skipping entries that can't be rendered
  // (a partner without a name or logo would crash the build).
  const partnerItems = (
    Array.isArray(content) ? content : Object.values(content || {})
  ).filter((p) => p && p.name && p.logo);
  const count = partnerItems.length;

  // `active` is the index of the partner shown in the centre slot.
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cycle through partner items every 5 seconds: the top logo moves into the
  // centre and the others shift down. Nothing to cycle with one partner.
  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setActive((prev) => prev + 1), 5000);
    return () => clearInterval(timer);
  }, [count]);

  // No partners: render nothing rather than crash the page.
  if (!count) return null;

  const visibleLogos = windowAt(partnerItems, active);
  const current = visibleLogos[1];

  // Outer container classes:
  // Desktop: horizontal layout with specific padding and height.
  // Mobile (<900px): vertical (column) layout with increased py-[5rem] and auto height.
  const sectionClasses = isMobile
    ? "flex flex-col px-8 py-[5rem] h-auto gap-6"
    : "flex px-[15rem] py-[5rem] h-[80vh] overflow-hidden gap-[2rem]";

  // Left carousel container classes:
  // Mobile: full width and fixed height; desktop: original layout.
  const carouselContainerClasses = isMobile
    ? "w-full relative h-[35rem] overflow-hidden border rounded-[25px]"
    : "w-[30%] relative h-full overflow-hidden border py-auto rounded-[25px]";

  // Right info container classes:
  // Mobile: full width (with extra top margin), desktop: as before.
  const infoContainerClasses = isMobile
    ? "w-full h-[80rem] flex flex-col justify-center overflow-hidden border px-6 py-6 rounded-[25px] mt-6"
    : "w-[70%] flex flex-col justify-center overflow-hidden border px-[5rem] py-[5rem] rounded-[25px]";

  return (
    <>
      <section className={sectionClasses}>
        {/* Left Logos Carousel */}
        <div className={carouselContainerClasses}>
          <AnimatePresence>
            {isMobile ? (
              // For screens below 900px, only display the middle logo.
              <motion.div
                className="relative w-full h-[8rem] pt-[15rem] flex justify-center items-center"
                key={current.name}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 1, ease: "linear" }}
              >
                <div className="gradient-border rounded-[25px]">
                  <div className="relative w-[12rem] h-[10rem] scale-155">
                    <Image
                      src={current.logo}
                      alt={current.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              // Desktop: render all logos with animated positioning.
              visibleLogos.map((item, i) => {
                if (!item) return null; // empty slot (fewer than 3 partners)
                const variants = {
                  initial: { y: i === 0 ? -300 : (i - 1) * 150, scale: 1 },
                  animate: { y: (i - 1) * 150, scale: i === 1 ? 1.15 : 1 },
                  exit: { y: i === 2 ? 300 : (i - 1) * 150, scale: 1 },
                };

                return (
                  <motion.div
                    key={item.name} // assuming name is unique
                    {...variants}
                    transition={{ duration: 1, ease: "linear" }}
                    className="absolute w-full h-[8rem] flex justify-center items-center"
                    style={{ top: "calc(50% - 4rem)" }}
                  >
                    {i === 1 ? (
                      <div className="gradient-border rounded-[25px]">
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
                );
              })
            )}
          </AnimatePresence>
        </div>
        {/* Right Text Info */}
        <div className={infoContainerClasses}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.name} // Active detail for the center item.
              initial={
                isMobile ? { opacity: 0, x: -50 } : { opacity: 0, y: -50 }
              }
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={isMobile ? { opacity: 0, x: 50 } : { opacity: 0, y: 50 }}
              transition={{ duration: 1, ease: "linear" }}
            >
              <h2 className="text-[4rem] font-bold mb-4">
                {current.name}
              </h2>
              <p className="mb-[2rem] text-[1.6rem] text-justify">
                {current.description}
              </p>
              <div className="flex flex-wrap gap-4">
                {(current.images || [])
                  .filter(Boolean)
                  .slice(0, 3)
                  .map((image, index) => (
                  <div key={index} className="relative w-[15rem] h-[15rem]">
                    <Image
                      src={image}
                      alt={`Partner image ${index + 1}`}
                      fill
                      className="object-cover rounded-[25px]"
                    />
                  </div>
                ))}
              </div>
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
          background: white;
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
