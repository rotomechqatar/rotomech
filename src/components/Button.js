"use client";

import { useRef } from "react";
import gsap from "gsap";

export default function Button({ text, textSize, bgc }) {
  const buttonRef = useRef(null);

  const createRipple = (e) => {
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;

    // Compute initial position based on the mouse event.
    const initialX = e.clientX - rect.left - size / 2;
    const initialY = e.clientY - rect.top - size / 2;
    ripple.style.left = `${initialX}px`;
    ripple.style.top = `${initialY}px`;

    // Style the ripple.
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.background =
      "radial-gradient(circle, rgba(53,253,30,0.9) 0%, rgba(34,181,243,0.9) 100%)";
    ripple.style.opacity = "0.8";
    ripple.style.pointerEvents = "none";
    ripple.style.zIndex = "0";

    // Append the ripple to the button.
    button.appendChild(ripple);

    // Define the target position (center of the button) for the directional effect.
    const targetX = rect.width / 2 - size / 2;
    const targetY = rect.height / 2 - size / 2;

    // Enhanced GSAP animation: slower, with translation toward the center.
    gsap.to(ripple, {
      duration: 2, // slowed down duration
      scale: 1, // scale up more gradually
      left: targetX, // animate horizontally to center
      top: targetY, // animate vertically to center
      opacity: 0, // fade out slowly
      ease: "power2.out",
      onComplete: () => ripple.remove(),
    });
  };

  return (
    <button
      ref={buttonRef}
      onMouseEnter={createRipple}
      className=" cursor-pointer relative overflow-hidden px-8 py-4 rounded-xl border border-blue backdrop-blur-3xl transition-all duration-300 hover:text-white hover:bg-black shadow-sm hover:scale-102 "
      style={{
        fontSize: textSize ? `${textSize}` : undefined,
        filter: "brightness(1.2)",
        backgroundColor: bgc ? `${bgc}` : undefined,
      }}
    >
      {text}
    </button>
  );
}
