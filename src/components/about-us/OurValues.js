"use client";

import Image from "next/image";
import Button from "../Button";
import Link from "next/link";

export default function OurValues({ content }) {
  return (
    <section className="relative mx-[15rem] pb-[5rem] max-14xl:mx-[10rem] max-6xl:mx-[5rem] max-6xl:py-[5rem]">
      <div className="absolute flex flex-col justify-center items-center text-center w-[100%] max-9xl:relative top-[10%]">
        <h2 className="text-[5rem]">{content.head}</h2>
        <p className="text-[2rem] w-[40%] max-9xl:w-[100%]">{content.text}</p>
        {/* <Link href="/contact-us" className="z-[100] mt-[5rem]">
          <Button text="Contact Us" textSize="2rem" />
        </Link> */}
      </div>
      <div className="max-9xl:flex max-9xl:flex-col max-9xl:gap-[5rem] mt-[10rem]">
        {/* each value set - 1 */}
        <div className="relative flex justify-between mx-[15rem] max-18xl:mx-[15rem] max-15xl:mx-[10rem] max-9xl:mx-0 max-9xl:justify-center max-9xl:gap-[15rem] max-5xl:gap-[5rem] ">
          <div className="flex flex-col items-center max-9xl:border max-9xl:px-[5rem] max-9xl:py-[1rem] rounded-[20px]">
            <span className="text-[6rem] text-gray-500 self-start max-9xl:text-[4rem] max-9xl:self-center ">
              01.
            </span>
            <div className="gradient-border relative h-[12rem] w-[12rem] rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 ">
              <Image
                src={content.icons[0]}
                alt={content.values[0]}
                className="object-contain p-[3rem]"
                fill
              />
            </div>
            <span className="text-center mt-[2rem] text-[2rem] font-bold">
              {content.values[0]}
            </span>
          </div>
          <div className="flex flex-col items-center max-9xl:border max-9xl:px-[5rem] max-9xl:py-[1rem] rounded-[20px]">
            <span className="text-[6rem] text-gray-500 self-start max-9xl:text-[4rem] max-9xl:self-center">
              06.
            </span>
            <div className="gradient-border relative h-[12rem] w-[12rem] rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300">
              <Image
                src={content.icons[5]}
                alt={content.values[5]}
                className="object-contain p-[3rem]"
                fill
              />
            </div>
            <span className="text-center mt-[2rem] text-[2rem] font-bold">
              {content.values[5]}
            </span>
          </div>
        </div>
        {/* each value set - 2 */}
        <div className="relative flex justify-between mx-[35rem] max-18xl:mx-[30rem] max-15xl:mx-[20rem] max-9xl:mx-0 max-9xl:justify-center max-9xl:gap-[15rem] max-5xl:gap-[5rem] max-9xl:gap-[2rem]">
          <div className="flex flex-col items-center max-9xl:border max-9xl:px-[5rem] max-9xl:py-[1rem] rounded-[20px]">
            <span className="text-[6rem] text-gray-500 self-start max-9xl:text-[4rem] max-9xl:self-center">
              02.
            </span>
            <div className="gradient-border relative h-[12rem] w-[12rem] rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300">
              <Image
                src={content.icons[1]}
                alt={content.values[1]}
                className="object-contain p-[3rem]"
                fill
              />
            </div>
            <span className="text-center mt-[2rem] text-[2rem] font-bold">
              {content.values[1]}
            </span>
          </div>
          <div className="flex flex-col items-center max-9xl:border max-9xl:px-[5rem] max-9xl:py-[1rem] rounded-[20px]">
            <span className="text-[6rem] text-gray-500 self-start max-9xl:text-[4rem] max-9xl:self-center">
              05.
            </span>
            <div className="gradient-border relative h-[12rem] w-[12rem] rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300">
              <Image
                src={content.icons[4]}
                alt={content.values[4]}
                className="object-contain p-[3rem]"
                fill
              />
            </div>
            <span className="text-center mt-[2rem] text-[2rem] font-bold">
              {content.values[4]}
            </span>
          </div>
        </div>
        {/* each value set - 3 */}
        <div className="relative flex justify-between mx-[60rem] max-18xl:mx-[45rem] max-15xl:mx-[30rem] max-9xl:mx-0 max-9xl:justify-center max-9xl:gap-[15rem] max-5xl:gap-[5rem] max-9xl:gap-[2rem]">
          <div className="flex flex-col items-center max-9xl:border max-9xl:px-[5rem] max-9xl:py-[1rem] rounded-[20px]">
            <span className="text-[6rem] text-gray-500 self-start max-9xl:text-[4rem] max-9xl:self-center">
              03.
            </span>
            <div className="gradient-border relative h-[12rem] w-[12rem] rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300">
              <Image
                src={content.icons[2]}
                alt={content.values[2]}
                className="object-contain p-[3rem]"
                fill
              />
            </div>
            <span className="text-center mt-[2rem] text-[2rem] font-bold">
              {content.values[2]}
            </span>
          </div>
          <div className="flex flex-col items-center max-9xl:border max-9xl:px-[5rem] max-9xl:py-[1rem] rounded-[20px]">
            <span className="text-[6rem] text-gray-500 self-start max-9xl:text-[4rem] max-9xl:self-center">
              04.
            </span>
            <div className="gradient-border relative h-[12rem] w-[12rem] rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300">
              <Image
                src={content.icons[3]}
                alt={content.values[3]}
                className="object-contain p-[3rem]"
                fill
              />
            </div>
            <span className="text-center mt-[2rem] text-[2rem] font-bold">
              {content.values[3]}
            </span>
          </div>
        </div>
      </div>
      <style jsx>{`
        .gradient-border {
          padding: 3px; /* Creates space for the animated border */
          border-radius: 9999px; /* Ensures a fully rounded border */
          background: linear-gradient(90deg, #35fd1e, #22b5f3, #35fd1e);
          background-size: 200%;
          animation: gradient-animation 5s linear infinite;
        }
        @keyframes gradient-animation {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </section>
  );
}
