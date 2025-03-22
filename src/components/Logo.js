"use client";

import Image from "next/image";

export default function Logo({ type }) {
  return (
    <div
      className={`relative flex flex-col items-center ${
        type === "footer" ? "w-[30%]" : ""
      } logo-animation`}
    >
      <div
        className={`relative self-center ${
          type === "footer" ? "h-[12rem] w-[5rem]" : "h-[8rem] w-[5rem]"
        } drop-animation-container`}
      >
        <Image
          src="/rotomech-drop.svg"
          className="object-contain"
          alt="rotomech drop logo"
          fill
        />
      </div>

      <div
        className={`absolute bottom-0 ${
          type === "footer" ? "h-[13rem] w-[15rem]" : "h-[8rem] w-[10rem]"
        } text-animation`}
      >
        <Image
          src="/rotomech-text.svg"
          className="object-contain"
          alt="rotomech text logo"
          fill
        />
      </div>

      <style jsx>{`
        /* Combined zoom and wiggle animation on the overall logo */
        .logo-animation {
          animation: zoomWiggleAnimation 4s ease infinite;
        }
        @keyframes zoomWiggleAnimation {
          0% {
            transform: scale(0.8) rotate(0deg);
          }
          25% {
            transform: scale(1) rotate(5deg);
          }
          50% {
            transform: scale(1) rotate(-5deg);
          }
          75% {
            transform: scale(1) rotate(3deg);
          }
          100% {
            transform: scale(0.8) rotate(0deg);
          }
        }

        /* Drop animation: drop from above and remain at the bottom */
        .drop-animation-container {
          animation: dropAnimation 4s ease infinite;
          position: relative;
          z-index: 2;
        }
        @keyframes dropAnimation {
          0% {
            transform: translateY(-100px);
            opacity: 0;
          }
          20% {
            transform: translateY(0);
            opacity: 1;
          }
          80% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0;
          }
        }

        /* Text fade animation in sync with the drop */
        .text-animation {
          animation: textFadeAnimation 4s ease infinite;
        }
        @keyframes textFadeAnimation {
          0% {
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
