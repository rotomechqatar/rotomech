"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ProductData({ content }) {
  // Convert the partners object to an array
  const partners = Object.values(content);
  // Start on the first partner that actually has product images
  const [selected, setSelected] = useState(
    Math.max(
      0,
      partners.findIndex((p) => p.images?.length),
    ),
  );
  const selectedPartner = partners[selected];
  if (!selectedPartner) return null;
  const images = selectedPartner.images || [];

  return (
    <div className="px-[15rem] max-12xl:px-[10rem] max-6xl:px-[5rem] py-[10rem]">
      <h2 className="mb-[4rem] text-[3rem]">Product Information</h2>
      <div className="flex flex-col gap-[4rem]">
        {/* Partner tabs wrap onto new lines so every partner stays visible */}
        <ul className="flex flex-wrap gap-4">
          {partners.map((partner, i) => (
            <motion.li
              key={i}
              whileHover={{ scale: 1.02 }}
              className={`cursor-pointer p-3 rounded-2xl transition-colors text-[2rem] font-semibold ${
                selected === i
                  ? "bg-blue text-white"
                  : "bg-blue-100 hover:bg-gray-200"
              }`}
              onClick={() => setSelected(i)}
            >
              {partner.name}
            </motion.li>
          ))}
        </ul>

        {/* Product images grid for selected partner */}
        <div className="p-4">
          {/* Keyed so each partner switch remounts and fades in; no exit
              step, so the new products never wait on the old ones */}
          <motion.div
            key={selected}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-[1.5rem] mb-[2rem] font-bold">Products</h4>
            {images.length ? (
              <div className="grid grid-cols-3 gap-[4rem] max-10xl:grid-cols-2 max-6xl:grid-cols-1">
                {images.map((img, i) => (
                  <div
                    key={img}
                    className="relative h-[30rem] w-[30rem] max-w-full rounded-[25px] shadow-2xl overflow-hidden justify-self-center bg-white"
                  >
                    <Image
                      src={img}
                      alt={`${selectedPartner.name} product ${i + 1}`}
                      className="object-cover"
                      fill
                      sizes="30rem"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[1.8rem] text-gray-500">
                Product details for {selectedPartner.name} are available on
                request.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
