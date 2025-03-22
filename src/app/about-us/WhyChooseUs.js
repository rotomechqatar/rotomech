import AnimatedSectionText from "@/components/AnimatedSectionText";
import LottieAnimation from "@/components/LottieAnimation";
import animationData from "@/animations/oil-pump.json";

export default function WhyChooseUs({ content }) {
  return (
    <section className="px-[15rem] py-[5rem] flex justify-center items-center gap-[5rem]">
      <div className="w-[50%] ">
        <LottieAnimation animationData={animationData} />
      </div>
      <div className="w-[50%]">
        <AnimatedSectionText
          heading={content.head}
          paragraphs={[content.text]}
        />
      </div>
    </section>
  );
}
