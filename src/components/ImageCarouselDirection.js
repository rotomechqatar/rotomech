"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

// Define 8 directions for the slide-in.
const directions = [
  { x: "0", y: "-100%" }, // top
  { x: "-100%", y: "0" }, // left
  { x: "0", y: "100%" }, // bottom
  { x: "100%", y: "0" }, // right
  { x: "100%", y: "-100%" }, // top-right
  { x: "-100%", y: "-100%" }, // top-left
  { x: "100%", y: "100%" }, // bottom-right
  { x: "-100%", y: "100%" }, // bottom-left
];

const SlidingImage = ({ src, offsetX, offsetY, onSlideComplete }) => {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Start the slide only after the image is fully loaded.
    if (loaded) {
      requestAnimationFrame(() => {
        setInView(true);
      });
    }
  }, [loaded]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        zIndex: 10, // Put this above the old image.
        transform: inView
          ? "translate(0, 0)"
          : `translate(${offsetX}, ${offsetY})`,
        transition: "transform 1s ease-in-out",
      }}
      // When the slide finishes, we can remove the old image from the DOM.
      onTransitionEnd={onSlideComplete}
    >
      <Image
        src={src}
        alt=""
        fill
        onLoadingComplete={() => setLoaded(true)}
        // Slight zoom on hover, purely optional:
        className="object-cover hover:scale-110 transition-all duration-300"
      />
    </div>
  );
};

const ImageCarouselDirection = ({ images }) => {
  // If the user passes an invalid array, show a message (after calling hooks).
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [directionIndex, setDirectionIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length < 3) return;
    const interval = setInterval(() => {
      setPrevIndex(currentIndex);
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setDirectionIndex((prev) => (prev + 1) % directions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, images]);

  // Bail out early if no valid images.
  if (!images || images.length < 3) {
    return (
      <div className="text-red-500">
        Minimum 3 images required to display the carousel.
      </div>
    );
  }

  const { x, y } = directions[directionIndex];

  const handleSlideComplete = () => {
    // When the new image finishes its slide, we remove the old image.
    setPrevIndex(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Old image stays behind the new one until the slide completes */}
      {prevIndex !== null && (
        <div className="absolute inset-0" style={{ zIndex: 5 }}>
          <Image src={images[prevIndex]} alt="" fill className="object-cover" />
        </div>
      )}

      {/* New sliding image */}
      <SlidingImage
        key={currentIndex}
        src={images[currentIndex]}
        offsetX={x}
        offsetY={y}
        onSlideComplete={handleSlideComplete}
      />
    </div>
  );
};

export default ImageCarouselDirection;
