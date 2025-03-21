"use client";

import Carousel from "@/components/Carousel";

export default function ClientSection({ content }) {
  const clientLogos = Object.entries(content).map(([key, src], index) => ({
    id: index + 1,
    src,
    alt: `Client ${index + 1}`,
  }));

  return (
    <section className="my-[5rem] overflow-x-hidden px-[15rem] pb-[5rem]">
      <h2 className="text-3xl font-bold text-center mb-[3rem]">Our Clients</h2>
      <div className="gradient-border p-[1rem] rounded-xl shadow-xl hover:scale-105 transition-all duration-1000">
        <div className="bg-white rounded-xl p-[3rem]">
          <Carousel items={clientLogos} autoPlaySpeed={3000} direction="left" />
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
  );
}
