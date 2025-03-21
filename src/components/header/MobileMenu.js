"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function MobileMenu({ menu, profile }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="hidden max-9xl:block relative">
      {/* Hamburger Button */}
      <button
        className="p-2 focus:outline-none"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {/* Top line */}
        <span
          className={`block w-[3rem] h-[3px] bg-white mb-1 transition-transform duration-300 ${
            isOpen ? "rotate-45 translate-y-[4px]" : ""
          }`}
        />
        {/* Middle line (hidden when open) */}
        <span
          className={`block w-6 h-[3px] bg-white mb-1 transition-opacity duration-300 ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Bottom line */}
        <span
          className={`block w-[3rem] h-[3px] bg-white transition-transform duration-300 ${
            isOpen ? "-rotate-45 -translate-y-[7px]" : ""
          }`}
        />
      </button>

      {/* Mobile menu panel (shown when isOpen === true) */}
      {isOpen && (
        <div className="absolute top-[6rem] right-0 w-[40rem] bg-black text-white px-[2rem] py-[2rem] z-50">
          <ul>
            {menu.map((item, index) => (
              <li key={index} className="py-2">
                <Link
                  href={item.link}
                  className=" text-[3rem] hover:text-green transition"
                  onClick={closeMenu} // closes menu when link is clicked
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
