"use client";

import Carousel from "@/components/Carousel";

export default function PartnerSection({ content }) {
  const partnerLogos = Object.entries(content).map(([key, src], index) => ({
    id: index + 1,
    src,
    alt: `Partner ${index + 1}`,
  }));

  return (
    <section className="mt-[10rem] overflow-x-hidden pb-[5rem] px-[15rem] max-11xl:px-[10rem] max-6xl:px-[5rem]">
      <h2 className="text-[5rem] font-bold text-left mb-[5rem]">
        Our Partners
      </h2>
      <div className="gradient-border p-[.5rem] rounded-xl shadow-xl hover:scale-105 transition-all duration-1000">
        <div className="bg-white rounded-xl p-[3rem]">
          <Carousel
            items={partnerLogos}
            autoPlaySpeed={3000}
            direction="right"
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
