"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function ProductData({ content }) {
  // Convert the partners object to an array
  const partners = Object.values(content);
  // Set the first partner as the default selected partner
  const [selectedPartner, setSelectedPartner] = useState(partners[0]);

  return (
    <div className="px-[15rem] max-12xl:px-[10rem] max-6xl:px-[5rem] py-[10rem]">
      <h2 className="mb-[4rem] text-[3rem]">Product Information</h2>
      <div className="flex flex-col gap-[5rem]">
        {/* Partners horizontal scrollable bar */}
        <div className="overflow-x-auto pb-[2rem]">
          <ul className="flex space-x-4">
            {partners.map((partner) => (
              <motion.li
                key={partner.name}
                whileHover={{ scale: 1.02 }}
                className={`cursor-pointer p-3 rounded-2xl transition-colors text-[2rem] font-semibold whitespace-nowrap ${
                  selectedPartner.name === partner.name
                    ? "bg-blue text-white"
                    : "bg-blue-100 hover:bg-gray-200"
                }`}
                onClick={() => setSelectedPartner(partner)}
              >
                {partner.name}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Product images grid for selected partner */}
        <div className="p-4">
          <AnimatePresence exitBeforeEnter>
            <motion.div
              key={selectedPartner.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <h4 className="text-[1.5rem] mb-[1rem] font-bold">Products</h4>
              <div className="grid grid-cols-3 gap-4 max-10xl:grid-cols-2 max-6xl:grid-cols-1 items-center justify-center h-[90vh] overflow-auto">
                {selectedPartner.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative h-[30rem] w-[30rem] rounded-[25px] shadow-2xl overflow-hidden justify-self-center"
                  >
                    <Image
                      src={img}
                      alt={`${selectedPartner.name} product ${i + 1}`}
                      className="object-cover"
                      fill
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
