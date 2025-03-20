"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

export default function OurLegacyImages({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageContainerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length]);

  // Compute inline styles for smooth transitions.
  const computeStyle = (image, isActive) => {
    if (isActive) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "50%",
      };
    } else {
      // For inactive images, we use consistent properties.
      if (image.position === "top-left") {
        return {
          top: "10%",
          left: "20px",
          transform: "translate(0, 0)",
          width: "40%",
        };
      } else if (image.position === "center") {
        return {
          top: "20%",
          left: "30%",
          transform: "translate(0, 0)",
          width: "40%",
        };
      } else if (image.position === "bottom-left") {
        return {
          top: "60%",
          left: "20px",
          transform: "translate(0, 0)",
          width: "40%",
        };
      } else if (image.position === "top-right") {
        return {
          top: "10%",
          left: "40%",
          transform: "translate(0, 0)",
          width: "40%",
        };
      } else if (image.position === "bottom-right") {
        return {
          top: "40%",
          left: "50%",
          transform: "translate(0, 0)",
          width: "40%",
        };
      }
    }
    return {};
  };

  return (
    <div className="relative w-[50%]" ref={imageContainerRef}>
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
