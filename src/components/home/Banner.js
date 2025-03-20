// components/home/Banner.js
import Image from "next/image";
import Button from "../Button";
import Link from "next/link";
import AnimatedText from "../AnimatedText";
import BannerBackground from "./BannerBackground";

export default function Banner({ content }) {
  return (
    <div className="relative w-full h-[90vh]">
      {/* Background Image */}
      <BannerBackground content={content} />

      {/* Black Overlay */}
      <div className="absolute inset-0 bg-black opacity-30 z-10"></div>

      {/* Text and CTA Container */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-white text-8xl font-bold">
          <AnimatedText text={content.tagline} />
        </h1>
        <h2 className="text-white text-5xl mt-10">
          <AnimatedText text={content.sub} />
        </h2>
        <div className="mt-8">
          <Link href="/products-and-partners">
            <Button text="Explore More" textSize="3rem" bgc="var(--ui-blue)" />
          </Link>
        </div>
      </div>
    </div>
  );
}
