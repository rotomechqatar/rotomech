"use client";

import Carousel from "@/components/Carousel";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ClientPopUp from "./ClientPopUp"; // Adjust path as needed

export default function ClientSection({ clientData }) {
  const [popupOpen, setPopupOpen] = useState(false);

  // Create a flat array of client logos from the nested clientData object.
  const clientLogos = Object.entries(clientData).flatMap(
    ([category, logos], catIndex) =>
      Object.entries(logos).map(([key, src], idx) => ({
        // Generate a unique ID using the category index and logo index.
        id: catIndex * 100 + idx + 1,
        src,
        alt: `Client ${key}`,
      }))
  );

  const handleClick = () => {
    setPopupOpen(true);
  };

  return (
    <>
      <section className="my-[5rem] overflow-x-hidden px-[15rem] pb-[5rem] max-11xl:px-[10rem] max-6xl:px-[5rem]">
        <h2 className="text-[5rem] font-bold text-left mb-[3rem]">
          Our Clients
        </h2>
        <div
          className="gradient-border p-[.5rem] rounded-xl shadow-xl hover:scale-105 transition-all duration-1000 cursor-pointer"
          onClick={handleClick}
        >
          <div className="bg-white rounded-xl p-[3rem]">
            <Carousel
              items={clientLogos}
              autoPlaySpeed={3000}
              direction="left"
              type="client"
            />
          </div>
        </div>
        <style jsx>{`
          .gradient-border {
            position: relative;
            border-radius: 1rem;
            overflow: hidden;
          }
          .gradient-border::before {
            content: "";
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              270deg,
              var(--ui-green, #35fd1e),
              var(--ui-blue, #22b5f3)
            );
            animation: gradientAnimation 8s ease infinite;
            z-index: -1;
          }
          @keyframes gradientAnimation {
            0% {
              transform: rotate(360deg);
            }
            100% {
              transform: rotate(0deg);
            }
          }
        `}</style>
      </section>

      <AnimatePresence>
        {popupOpen && (
          <ClientPopUp
            content={clientData}
            onClose={() => setPopupOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
