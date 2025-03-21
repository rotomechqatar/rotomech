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

    // Style the ripple: this is the only place where the gradient background appears.
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.background =
      "radial-gradient(circle, rgba(53,253,30,0.9) 0%, rgba(34,181,243,0.9) 100%)";
    ripple.style.opacity = "1";
    ripple.style.pointerEvents = "none";
    ripple.style.zIndex = "0";

    // Append the ripple to the button.
    button.appendChild(ripple);

    // Define the target position (center of the button) for the ripple effect.
    const targetX = rect.width / 2 - size / 2;
    const targetY = rect.height / 2 - size / 2;

    // GSAP animation for the ripple effect.
    gsap.to(ripple, {
      duration: 2,
      scale: 1,
      left: targetX,
      top: targetY,
      opacity: 0,
      ease: "power2.out",
      onComplete: () => ripple.remove(),
    });
  };

  return (
    <button
      ref={buttonRef}
      onMouseEnter={createRipple}
      className="cursor-pointer relative overflow-hidden px-8 py-4 rounded-xl border backdrop-blur-3xl transition-all duration-300 text-black bg-white shadow-xl hover:scale-102"
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
