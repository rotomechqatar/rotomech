"use client";

import Image from "next/image";
// Optional imports if needed later:
// import Button from "../Button";
// import Link from "next/link";
import { useState, useEffect } from "react";

export default function OurValues({ content }) {
  // --- Client-Side Screen Width Detection ---
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsLargeScreen(window.innerWidth >= 900);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // --- Safety Check ---
  if (
    !content ||
    !content.icons ||
    !content.values ||
    content.icons.length < 6 ||
    content.values.length < 6
  ) {
    console.error(
      "OurValues component requires content with head, text, and arrays of at least 6 icons and values."
    );
    return null;
  }

  // --- Configuration for Circular Layout (Large Screens) ---
  const numberOfItems = 6;
  const angleStep = (2 * Math.PI) / numberOfItems;
  const radius = 350; // Orbit radius in px

  const getStyleForCircleItem = (index) => {
    const angle = angleStep * index - Math.PI / 2; // Start from top (−90°)
    const xPos = Math.cos(angle) * radius;
    const yPos = Math.sin(angle) * radius;
    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: `translate(calc(-50% + ${xPos}px), calc(-50% + ${yPos}px))`,
    };
  };

  // Flat array for circular mapping (6 items)
  // (Numbers are no longer used, so we only need the index.)
  const flatValueData = [
    { index: 0 },
    { index: 1 },
    { index: 2 },
    { index: 3 },
    { index: 4 },
    { index: 5 },
  ];

  // Common classes for the icon container and image
  const iconContainerBaseClass =
    "gradient-border relative h-[12rem] w-[12rem] rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300";
  const imageBaseClass = "object-contain p-[3rem]";

  return (
    <section
      className={`relative mx-auto px-4 sm:px-[5rem] lg:px-[10rem] xl:px-[15rem] pb-[5rem] ${
        isLargeScreen
          ? "py-[5rem] min-h-[100vh] flex items-center justify-center"
          : "pt-[5rem]"
      }`}
    >
      {isLargeScreen ? (
        // --- Desktop Circular Layout ---
        <div className="relative w-full min-h-[60rem]">
          {/* Central "Sun": Heading and Text (always visible on large screens) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 w-[45%] mx-auto">
            <h2 className="text-[5rem] font-bold">{content.head}</h2>
            <p className="text-[2rem] mt-4">{content.text}</p>
          </div>
          {/* Outer Circle Container */}
          <div
            className="values-circle relative mx-auto mt-20"
            style={{ width: "800px", height: "800px" }}
          >
            {flatValueData.map((item) => (
              <div
                key={item.index}
                className="flex flex-col items-center text-center"
                style={getStyleForCircleItem(item.index)}
              >
                <div className={iconContainerBaseClass}>
                  <Image
                    src={content.icons[item.index]}
                    alt={content.values[item.index]}
                    className={imageBaseClass}
                    fill
                  />
                </div>
                <span className="mt-4 text-[2rem] font-bold">
                  {content.values[item.index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // --- Mobile Layout (Below 900px) ---
        <div className="mobile-layout flex flex-col gap-[5rem]">
          <div className="mt-12 flex flex-col items-center text-center">
            <h2 className="text-[4rem] sm:text-[4rem] font-bold">
              {content.head}
            </h2>
            <p className="text-[1.5rem] sm:text-[1.75rem] lg:text-[2rem] w-[90%] sm:w-[70%] mx-auto mt-4">
              {content.text}
            </p>
          </div>
          {/* First Row: Items 01 & 06 */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-[3rem] sm:gap-[5rem] lg:gap-[15rem]">
            {/* Item 01 */}
            <div className="flex flex-col items-center px-[3rem] py-[1rem] rounded-[20px] w-[90%] sm:w-auto">
              <div className={iconContainerBaseClass}>
                <Image
                  src={content.icons[0]}
                  alt={content.values[0]}
                  className={imageBaseClass}
                  fill
                  sizes="12rem"
                />
              </div>
              <span className="mt-[2rem] text-[1.5rem] font-bold text-center">
                {content.values[0]}
              </span>
            </div>
            {/* Item 06 */}
            <div className="flex flex-col items-center px-[3rem] py-[1rem] rounded-[20px] w-[90%] sm:w-auto">
              <div className={iconContainerBaseClass}>
                <Image
                  src={content.icons[5]}
                  alt={content.values[5]}
                  className={imageBaseClass}
                  fill
                  sizes="12rem"
                />
              </div>
              <span className="mt-[2rem] text-[1.5rem] font-bold text-center">
                {content.values[5]}
              </span>
            </div>
          </div>
          {/* Second Row: Items 02 & 05 */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-[3rem] sm:gap-[5rem] lg:gap-[15rem]">
            {/* Item 02 */}
            <div className="flex flex-col items-center px-[3rem] py-[1rem] rounded-[20px] w-[90%] sm:w-auto">
              <div className={iconContainerBaseClass}>
                <Image
                  src={content.icons[1]}
                  alt={content.values[1]}
                  className={imageBaseClass}
                  fill
                  sizes="12rem"
                />
              </div>
              <span className="mt-[2rem] text-[1.5rem] font-bold text-center">
                {content.values[1]}
              </span>
            </div>
            {/* Item 05 */}
            <div className="flex flex-col items-center px-[3rem] py-[1rem] rounded-[20px] w-[90%] sm:w-auto">
              <div className={iconContainerBaseClass}>
                <Image
                  src={content.icons[4]}
                  alt={content.values[4]}
                  className={imageBaseClass}
                  fill
                  sizes="12rem"
                />
              </div>
              <span className="mt-[2rem] text-[1.5rem] font-bold text-center">
                {content.values[4]}
              </span>
            </div>
          </div>
          {/* Third Row: Items 03 & 04 */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-[3rem] sm:gap-[5rem] lg:gap-[15rem]">
            {/* Item 03 */}
            <div className="flex flex-col items-center px-[3rem] py-[1rem] rounded-[20px] w-[90%] sm:w-auto">
              <div className={iconContainerBaseClass}>
                <Image
                  src={content.icons[2]}
                  alt={content.values[2]}
                  className={imageBaseClass}
                  fill
                  sizes="12rem"
                />
              </div>
              <span className="mt-[2rem] text-[1.5rem] font-bold text-center">
                {content.values[2]}
              </span>
            </div>
            {/* Item 04 */}
            <div className="flex flex-col items-center px-[3rem] py-[1rem] rounded-[20px] w-[90%] sm:w-auto">
              <div className={iconContainerBaseClass}>
                <Image
                  src={content.icons[3]}
                  alt={content.values[3]}
                  className={imageBaseClass}
                  fill
                  sizes="12rem"
                />
              </div>
              <span className="mt-[2rem] text-[1.5rem] font-bold text-center">
                {content.values[3]}
              </span>
            </div>
          </div>
          {/* Centered Heading & Text for Mobile (always visible) */}
        </div>
      )}
      {/* Gradient Border Animation */}
      <style jsx>{`
        .gradient-border {
          padding: 3px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #35fd1e, #22b5f3, #35fd1e);
          background-size: 200%;
          animation: gradient-animation 5s linear infinite;
          background-clip: padding-box;
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
    </section>
  );
}
