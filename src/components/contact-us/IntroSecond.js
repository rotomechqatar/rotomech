"use client";
import { useState } from "react";
import Image from "next/image";

export default function IntroSecond({ content }) {
  const [copiedTel, setCopiedTel] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const copyToClipboard = (text, setCopied) => {
    if (navigator?.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for older browsers and mobile devices
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <div className="flex flex-col border h-[100%] rounded-[25px] px-[5rem] py-[3rem]">
      <p className="text-[2rem]">{content.text}</p>
      <div className="text-[1.5rem] mt-[3rem] flex flex-col gap-[1rem]">
        <div
          className="group inline-block cursor-pointer"
          onClick={() => copyToClipboard(content.tel, setCopiedTel)}
        >
          <p className="inline">Telephone: {content.tel}</p>
          <span
            className={`ml-2 text-sm transition-opacity ${
              copiedTel ? "opacity-100" : "opacity-0 group-hover:opacity-50"
            }`}
          >
            {copiedTel ? "Copied" : "Click to copy"}
          </span>
        </div>
        <div
          className="group inline-block cursor-pointer"
          onClick={() => copyToClipboard(content.mobile, setCopiedMobile)}
        >
          <p className="inline">Mobile: {content.mobile}</p>
          <span
            className={`ml-2 text-sm transition-opacity ${
              copiedMobile ? "opacity-100" : "opacity-0 group-hover:opacity-50"
            }`}
          >
            {copiedMobile ? "Copied" : "Click to copy"}
          </span>
        </div>
        <div
          className="group inline-block cursor-pointer"
          onClick={() => copyToClipboard(content.email, setCopiedEmail)}
        >
          <p className="inline">Email: {content.email}</p>
          <span
            className={`ml-2 text-sm transition-opacity ${
              copiedEmail ? "opacity-100" : "opacity-0 group-hover:opacity-50"
            }`}
          >
            {copiedEmail ? "Copied" : "Click to copy"}
          </span>
        </div>
      </div>
      <div className="relative h-[4rem] w-[4rem] self-center mt-[2rem] overflow-hidden">
        <Image
          src="/icons/arrow-down.svg"
          alt="arrow-down"
          fill
          className="object-cover animate-drop"
        />
      </div>
    </div>
  );
}
