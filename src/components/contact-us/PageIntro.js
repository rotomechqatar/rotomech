import AnimatedSectionText from "../AnimatedSectionText";
import IntroSecond from "./IntroSecond";

export default function PageIntro({ content }) {
  return (
    <section className="my-[10rem] px-[15rem] grid grid-cols-3 justify-center items-center gap-[5rem] max-14xl:px-[10rem] max-9xl:grid-cols-1 max-6xl:px-[5rem]">
      <div className="relative group col-span-2 h-[100%] max-6xl:col-span-1">
        {/* Gradient Border Overlay */}
        <div className="absolute -inset-0.5 rounded-[25px] bg-gradient-to-r from-green to-blue opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
        <div className="relative border shadow-2xl px-[5rem] py-[3rem] rounded-[25px] bg-white text-black hover:scale-103 hover:bg-black hover:text-white transition-all duration-500 h-full">
          <AnimatedSectionText
            heading={content.head}
            paragraphs={[content.text]}
          />
        </div>
      </div>

      <IntroSecond content={content.cta} />
    </section>
  );
}
