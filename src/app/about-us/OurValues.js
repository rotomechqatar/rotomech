import animationData from "@/animations/value.json";
import AnimatedSectionText from "@/components/AnimatedSectionText";
import LottieAnimation from "@/components/LottieAnimation";

export default function OurValues({ content }) {
  return (
    <section className="px-[15rem] py-[10rem] mt-[5rem] bg-black text-white flex justify-center items-center gap-[5rem] transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black">
      <div className="">
        <AnimatedSectionText
          heading={content.head}
          paragraphs={[content.text]}
        />
      </div>
      <div className="w-[40%] ">
        <LottieAnimation animationData={animationData} />
      </div>
    </section>
  );
}
