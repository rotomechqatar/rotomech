"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// Define the 8 directions with their initial offsets.
const directions = [
  { x: "0", y: "-100%" }, // top
  { x: "-100%", y: "0" }, // left
  { x: "0", y: "100%" }, // bottom
  { x: "100%", y: "0" }, // right
  { x: "100%", y: "-100%" }, // top right
  { x: "-100%", y: "-100%" }, // top left
  { x: "100%", y: "100%" }, // bottom right
  { x: "-100%", y: "100%" }, // bottom left
];

const SlidingImage = ({ src, offsetX, offsetY, onTransitionEnd }) => {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Trigger the animation on the next frame after mounting.
    const timer = requestAnimationFrame(() => {
      setInView(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className="absolute w-full h-full rounded-[25px] overflow-hidden"
      style={{
        transform: inView
          ? "translate(0, 0)"
          : `translate(${offsetX}, ${offsetY})`,
        transition: "transform 1s ease-in-out",
      }}
      onTransitionEnd={onTransitionEnd}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover hover:scale-110 transition-all duration-300"
      />
    </div>
  );
};

const ImageCarouselDirection = ({ images }) => {
  if (!images || images.length < 3) {
    return (
      <div className="text-red-500">
        Minimum 3 images required to display the carousel.
      </div>
    );
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [prevImageIndex, setPrevImageIndex] = useState(null);
  const [directionIndex, setDirectionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevImageIndex(currentImageIndex);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setDirectionIndex((prev) => (prev + 1) % directions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentImageIndex, images.length]);

  const { x, y } = directions[directionIndex];

  const handleTransitionEnd = () => {
    setPrevImageIndex(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {prevImageIndex !== null && (
        <div className="absolute w-full h-full">
          <Image
            src={images[prevImageIndex]}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}
      <SlidingImage
        key={currentImageIndex}
        src={images[currentImageIndex]}
        offsetX={x}
        offsetY={y}
        onTransitionEnd={handleTransitionEnd}
      />
    </div>
  );
};

export default ImageCarouselDirection;
