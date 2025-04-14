"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";

export default function ClientPopUp({ onClose, content }) {
  // Set initial active tab.
  const [activeTab, setActiveTab] = useState("energy");

  // Convert the logo objects into arrays.
  const energyLogos = content.energy ? Object.values(content.energy) : [];
  const infrastructureLogos = content.infrastructure
    ? Object.values(content.infrastructure)
    : [];

  // Determine which logos to display based on the active tab.
  const logosToDisplay =
    activeTab === "energy" ? energyLogos : infrastructureLogos;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl relative shadow-2xl overflow-hidden"
        style={{ width: "60vw", height: "80vh" }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        {/* Close Button */}
        <button
          className="absolute top-[2rem] right-[2rem] text-5xl font-bold text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Content Container */}
        <div className="flex flex-col h-full py-[5rem] px-[1rem]">
          <h2 className="text-5xl font-bold mb-10 text-center">Our Clients</h2>

          {/* Tabs */}
          <div className="flex justify-center mb-[3rem] text-[2rem]">
            <button
              onClick={() => setActiveTab("energy")}
              className={`px-6 py-2 mx-2 border-b-2 focus:outline-none ${
                activeTab === "energy"
                  ? "border-green-400 text-green-600 font-semibold"
                  : "border-transparent text-gray-500"
              }`}
            >
              Energy
            </button>
            <button
              onClick={() => setActiveTab("infrastructure")}
              className={`px-6 py-2 mx-2 border-b-2 focus:outline-none ${
                activeTab === "infrastructure"
                  ? "border-green-400 text-green-600 font-semibold"
                  : "border-transparent text-gray-500"
              }`}
            >
              Infrastructure
            </button>
          </div>

          {/* Logos Display Area */}
          <div className="flex-1 overflow-auto">
            <motion.div
              className="grid grid-cols-3 max-10xl:grid-cols-2 max-6xl:grid-cols-1 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {logosToDisplay.map((src, index) => (
                <div
                  key={index}
                  className="relative w-80 h-100 justify-self-center"
                >
                  <Image
                    src={src}
                    alt={`${activeTab} logo ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
