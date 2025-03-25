"use client";
import dynamic from "next/dynamic";
import animationData from "@/animations/dev.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function UnderDevelopment() {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-black via-blue-900 to-white flex flex-col items-center justify-center text-white text-center p-4">
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ height: "300px", width: "300px" }}
      />
      <h1 className="text-6xl font-bold mb-4 animate-bounce">
        Stay Tuned. Page Do not exist yet!
      </h1>
      <p className="text-5xl mb-8">This page is currently under development.</p>
      <div className="space-y-2 text-xl">
        <p className="animate-pulse text-3xl">
          Design and Development -
          <a
            href="https://www.melvinprince.io"
            className="underline hover:text-gray-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            Melvin Prince
          </a>
        </p>
      </div>
    </div>
  );
}
