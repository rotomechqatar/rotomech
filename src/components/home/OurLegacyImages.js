"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// A simple custom hook to check if screen size is below 900px
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export default function OurLegacyImages({ images }) {
  const isMobile = useIsMobile();

  // If on mobile, render a simpler auto‐sliding carousel that takes full width
  if (isMobile) {
    return <SimpleAutoCarousel images={images} />;
  }

  // Otherwise, render the fancy stacked version
  return <StackedImages images={images} />;
}

// ------------------------------------------------
// The "mobile" version: auto‐sliding, full‐width images
function SimpleAutoCarousel({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Auto‐slide every 3 seconds
    return () => clearInterval(timer);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full rounded-[25px] overflow-hidden shadow-2xl">
      <Image
        src={images[activeIndex].src}
        alt={images[activeIndex].alt}
        // Provide a nominal width/height to allow Next.js to optimize
        // Then override with "w-full h-auto" to fill the container
        width={1200}
        height={800}
        className="w-full h-[50rem] object-cover block"
      />
    </div>
  );
}

// ------------------------------------------------
// The "desktop" version: your original stacked images layout
function StackedImages({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageContainerRef = useRef(null);

  // Cycle through images every 2.5 seconds (unchanged)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length]);

  // Keep your existing logic for positioning
  const computeStyle = (image, isActive) => {
    if (isActive) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "50%",
      };
    } else {
      switch (image.position) {
        case "top-left":
          return {
            top: "10%",
            left: "20px",
            transform: "translate(0, 0)",
            width: "40%",
          };
        case "center":
          return {
            top: "20%",
            left: "30%",
            transform: "translate(0, 0)",
            width: "40%",
          };
        case "bottom-left":
          return {
            top: "60%",
            left: "20px",
            transform: "translate(0, 0)",
            width: "40%",
          };
        case "top-right":
          return {
            top: "10%",
            left: "40%",
            transform: "translate(0, 0)",
            width: "40%",
          };
        case "bottom-right":
          return {
            top: "40%",
            left: "50%",
            transform: "translate(0, 0)",
            width: "40%",
          };
        default:
          return {};
      }
    }
  };

  return (
    <div className="relative w-[50%] max-9xl:w-[100%]" ref={imageContainerRef}>
      {images.map((image, index) => {
        const isActive = index === activeIndex;
        const inlineStyle = computeStyle(image, isActive);
        return (
          <div
            key={index}
            className={`absolute transition-all duration-700 ease-in-out border-1 p-2 border-green rounded-2xl ${
              isActive ? "z-20 scale-110" : "z-10 scale-100"
            }`}
            style={inlineStyle}
          >
            <Image
              src={image.src}
              alt={image.alt}
              className="w-full h-auto object-cover block rounded-2xl hover:scale-110 transition-all duration-300"
              width={500}
              height={500}
            />
          </div>
        );
      })}
    </div>
  );
}
