"use client";

import Carousel from "@/components/Carousel";
import Link from "next/link";

export default function PartnerSection({ content, type }) {
  const partnerLogos = Object.entries(content).map(([key, src], index) => ({
    id: index + 1,
    src,
    alt: `Partner ${index + 1}`,
  }));

  const carouselContent = (
    <div className="gradient-border p-[.5rem] rounded-xl shadow-xl transition-all duration-1000">
      <div className="bg-white rounded-xl p-[3rem]">
        <Carousel
          type="partner"
          items={partnerLogos}
          autoPlaySpeed={3000}
          direction="right"
        />
      </div>
    </div>
  );

  return (
    <section className="mt-[10rem] overflow-x-hidden pb-[5rem] px-[15rem] max-11xl:px-[10rem] max-6xl:px-[5rem]">
      {type && (
        <h2 className="text-[5rem] font-bold text-left mb-[5rem]">
          Our Partners
        </h2>
      )}
      {type ? (
        // When type exists, no link and no hover effect will be applied.
        carouselContent
      ) : (
        // Otherwise, wrap the carousel in a Link with the hover effect.
        <Link href="/products-and-partners">
          <div className="hover:scale-105">{carouselContent}</div>
        </Link>
      )}
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
            var(--ui-blue, #22b5f3),
            var(--ui-green, #35fd1e)
          );
          animation: gradientAnimation1 8s ease infinite;
          z-index: -1;
        }
        @keyframes gradientAnimation1 {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
