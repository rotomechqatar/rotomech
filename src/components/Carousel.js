"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

const Carousel = ({
  items,
  autoPlaySpeed = 3000,
  visibleCountDesktop = 5,
  visibleCountTablet = 3,
  visibleCountMobile = 1,
  direction = "right",
}) => {
  const n = items.length;
  // Duplicate items for seamless looping.
  const extendedItems = [...items, ...items];

  // For right direction, start at 0; for left, start at the beginning of the second half.
  const [currentIndex, setCurrentIndex] = useState(
    direction === "left" ? n : 0
  );
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [visibleCount, setVisibleCount] = useState(visibleCountDesktop);
  const slideWidthPercent = 100 / visibleCount;
  const containerRef = useRef(null);

  // Update visibleCount based on screen width.
  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setVisibleCount(visibleCountDesktop);
      } else if (width >= 768) {
        setVisibleCount(visibleCountTablet);
      } else {
        setVisibleCount(visibleCountMobile);
      }
    };
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [visibleCountDesktop, visibleCountTablet, visibleCountMobile]);

  // Auto slide: move one slide at a time based on the provided direction.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (direction === "right" ? prev + 1 : prev - 1));
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [autoPlaySpeed, direction]);

  // When transition ends, check if we need to snap.
  const handleTransitionEnd = () => {
    if (direction === "right" && currentIndex >= n) {
      // We've advanced past the original items—snap back.
      setIsTransitionEnabled(false);
      setCurrentIndex((prev) => prev - n);
    }
    if (direction === "left" && currentIndex < 0) {
      // We've moved before the first item—snap to the mirrored position.
      setIsTransitionEnabled(false);
      setCurrentIndex((prev) => prev + n);
    }
  };

  // Re-enable transition on the next frame if it was disabled.
  useEffect(() => {
    if (!isTransitionEnabled) {
      requestAnimationFrame(() => {
        setIsTransitionEnabled(true);
      });
    }
  }, [isTransitionEnabled]);

  return (
    <div className="overflow-hidden relative" ref={containerRef}>
      <div
        className="flex"
        style={{
          transition: isTransitionEnabled
            ? "transform 0.5s ease-in-out"
            : "none",
          transform: `translateX(-${currentIndex * slideWidthPercent}%)`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {extendedItems.map((item, index) => (
          <div
            key={index}
            className="flex-none px-2"
            style={{ width: `${slideWidthPercent}%` }}
          >
            <div className="relative h-32 w-full">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-contain hover:scale-110 transition-all duration-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
