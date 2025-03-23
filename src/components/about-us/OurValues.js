import animationData from "@/animations/value.json";
import AnimatedSectionText from "@/components/AnimatedSectionText";
import LottieAnimation from "@/components/LottieAnimation";

export default function OurValues({ content }) {
  return (
    <section className="px-[15rem] py-[10rem] mt-[5rem] bg-black text-white flex justify-center items-center gap-[5rem] transition-all duration-300 hover:scale-105 max-15xl:px-[10rem] max-9xl:grid max-9xl:grid-cols-1 max-6xl:px-[5rem]">
      <div className="">
        <AnimatedSectionText
          heading={content.head}
          paragraphs={[content.text]}
        />
      </div>
      <div className="w-[40%] max-9xl:w-[20%] max-9xl:row-start-1 max-9xl:mx-auto">
        <LottieAnimation animationData={animationData} />
      </div>
    </section>
  );
}
