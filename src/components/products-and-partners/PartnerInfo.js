// "use client";
//
// import { useEffect, useState } from "react";
// import Image from "next/image";
// import { motion, AnimatePresence } from "framer-motion";
//
// export default function PartnerInfiniteCarousel({ content }) {
//   console.log("PartnerInfiniteCarousel content", content);
//
//   // Convert content to an array if it's not already
//   const partnerItems = Array.isArray(content)
//     ? content
//     : Object.values(content);
//
//   // Assume partnerItems has at least three items.
//   const [visibleLogos, setVisibleLogos] = useState(partnerItems.slice(0, 3));
//   // nextIndex points to the next logo in the array (cyclically)
//   const [nextIndex, setNextIndex] = useState(3);
//
//   useEffect(() => {
//     const timer = setInterval(() => {
//       const newLogo = partnerItems[nextIndex % partnerItems.length];
//       // New visible logos: new logo enters at top, previous top becomes middle, previous middle becomes bottom.
//       setVisibleLogos((prev) => [newLogo, prev[0], prev[1]]);
//       setNextIndex((prev) => prev + 1);
//     }, 5000);
//
//     return () => clearInterval(timer);
//   }, [partnerItems, nextIndex]);
//
//   return (
//     <>
//       <section className="flex px-[15rem] py-[5rem] h-[80vh] overflow-hidden gap-[2rem]">
//         {/* Left Logos Carousel */}
//         <div className="w-[30%] relative h-full overflow-hidden border py-auto rounded-[25px]">
//           <AnimatePresence>
//             {visibleLogos.map((item, i) => (
//               <motion.div
//                 key={item.name} // assuming name is unique
//                 // Positions are computed relative to center: (i - 1) * 150
//                 initial={{ y: i === 0 ? -300 : (i - 1) * 150, scale: 1 }}
//                 animate={{ y: (i - 1) * 150, scale: i === 1 ? 1.15 : 1 }}
//                 exit={{ y: i === 2 ? 300 : (i - 1) * 150, scale: 1 }}
//                 transition={{ duration: 1, ease: "linear" }}
//                 className="absolute w-full h-[8rem] flex justify-center items-center"
//                 style={{ top: "calc(50% - 4rem)" }}
//               >
//                 {i === 1 ? (
//                   // Center logo: wrap in a container that has an animated gradient border.
//                   <div className="gradient-border rounded-[25px] ">
//                     <div className="relative w-[12rem] h-[10rem] scale-155">
//                       <Image
//                         src={item.logo}
//                         alt={item.name}
//                         fill
//                         className="object-contain"
//                       />
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="relative w-[12rem] h-[10rem]">
//                     <Image
//                       src={item.logo}
//                       alt={item.name}
//                       fill
//                       className="object-contain"
//                     />
//                   </div>
//                 )}
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>
//         {/* Right Text Info */}
//         <div className="w-[70%] flex flex-col justify-center overflow-hidden border px-[5rem] py-[5rem] rounded-[25px]">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={visibleLogos[1].name} // Display the middle item as active detail.
//               initial={{ opacity: 0, y: -50 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: 50 }}
//               transition={{ duration: 1, ease: "linear" }}
//             >
//               <h2 className="text-[4rem] font-bold mb-4">
//                 {visibleLogos[1].name}
//               </h2>
//               <p className="mb-[2rem] text-[1.6rem] text-justify">
//                 {visibleLogos[1].description}
//               </p>
//               <div className="flex">
//                 {visibleLogos[1].images.map((image, index) => (
//                   <div
//                     key={index}
//                     className="relative w-[15rem] h-[15rem] mr-4"
//                   >
//                     <Image
//                       src={image || "/images/placeholder.png"}
//                       alt={`Partner image ${index + 1}`}
//                       fill
//                       className="object-cover rounded-[25px]"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </section>
//
//       {/* Gradient border CSS */}
//       <style jsx>{`
//         .gradient-border {
//           position: relative;
//           border: 1px solid transparent;
//           height: 17rem;
//           width: 20rem;
//           border-radius: 25px;
//           background: linear-gradient(90deg, #3b82f6, #10b981, #3b82f6);
//           background-size: 200%;
//           animation: gradient-animation 5s linear infinite;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//         .gradient-border > div {
//           background: white;
//           border-radius: 25px;
//           padding: 3rem 8rem;
//         }
//         @keyframes gradient-animation {
//           0% {
//             background-position: 0% 50%;
//           }
//           100% {
//             background-position: 200% 50%;
//           }
//         }
//       `}</style>
//     </>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function PartnerInfiniteCarousel({ content }) {
  console.log("PartnerInfiniteCarousel content", content);

  // Convert content to an array if it's not already.
  const partnerItems = Array.isArray(content)
    ? content
    : Object.values(content);

  // Assume partnerItems has at least three items.
  const [visibleLogos, setVisibleLogos] = useState(partnerItems.slice(0, 3));
  // nextIndex points to the next logo in the array (cyclically)
  const [nextIndex, setNextIndex] = useState(3);

  // State to determine if current screen is mobile (width < 900px)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Cycle through partner items every 5 seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      const newLogo = partnerItems[nextIndex % partnerItems.length];
      // Shift logos: new logo enters at beginning, previous items shift down.
      setVisibleLogos((prev) => [newLogo, prev[0], prev[1]]);
      setNextIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, [partnerItems, nextIndex]);

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
                key={visibleLogos[1].name}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 1, ease: "linear" }}
              >
                <div className="gradient-border rounded-[25px]">
                  <div className="relative w-[12rem] h-[10rem] scale-155">
                    <Image
                      src={visibleLogos[1].logo}
                      alt={visibleLogos[1].name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              // Desktop: render all logos with animated positioning.
              visibleLogos.map((item, i) => {
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
              key={visibleLogos[1].name} // Active detail for the center item.
              initial={
                isMobile ? { opacity: 0, x: -50 } : { opacity: 0, y: -50 }
              }
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={isMobile ? { opacity: 0, x: 50 } : { opacity: 0, y: 50 }}
              transition={{ duration: 1, ease: "linear" }}
            >
              <h2 className="text-[4rem] font-bold mb-4">
                {visibleLogos[1].name}
              </h2>
              <p className="mb-[2rem] text-[1.6rem] text-justify">
                {visibleLogos[1].description}
              </p>
              <div className="flex flex-wrap gap-4">
                {visibleLogos[1].images.slice(0, 3).map((image, index) => (
                  <div key={index} className="relative w-[15rem] h-[15rem]">
                    <Image
                      src={image || "/images/placeholder.png"}
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
