"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Carousel = ({
  type,
  items,
  autoPlaySpeed = 3000,
  visibleCountDesktop = 5,
  visibleCountTablet = 3,
  visibleCountMobile = 1,
  direction = "right",
}) => {
  const n = items.length;
  const extendedItems = [...items, ...items];

  const [currentIndex, setCurrentIndex] = useState(
    direction === "left" ? n : 0
  );
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);
  const [visibleCount, setVisibleCount] = useState(visibleCountDesktop);
  const [isHovered, setIsHovered] = useState(false);

  const slideWidthPercent = 100 / visibleCount;
  const containerRef = useRef(null);

  // Tooltip message based on type prop.
  const tooltipMessage =
    type === "partner"
      ? "Know more about Partners"
      : type === "client"
      ? "Know more about Clients"
      : "";

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
    if (isHovered) return; // Pause when hovered
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (direction === "right" ? prev + 1 : prev - 1));
    }, autoPlaySpeed);
    return () => clearInterval(timer);
  }, [autoPlaySpeed, direction, isHovered]);

  // Handle transition snapping.
  const handleTransitionEnd = () => {
    if (direction === "right" && currentIndex >= n) {
      setIsTransitionEnabled(false);
      setCurrentIndex((prev) => prev - n);
    }
    if (direction === "left" && currentIndex < 0) {
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
    <div
      className="overflow-hidden relative hover:cursor-pointer"
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip overlay */}
      <AnimatePresence>
        {isHovered && tooltipMessage && (
          <motion.div
            className="absolute top-[-2rem] left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md bg-white shadow-md text-2xl text-gray-800 pointer-events-none z-[100]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {tooltipMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
            <div className="relative h-50 w-full">
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
