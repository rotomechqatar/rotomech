import AnimatedSectionText from "../AnimatedSectionText";
import IntroSecond from "./IntroSecond";

export default function PageIntro({ content }) {
  return (
    <section className="my-[10rem] px-[15rem] grid grid-cols-3 justify-center items-center gap-[5rem] max-14xl:px-[10rem] max-9xl:grid-cols-1 max-6xl:px-[5rem]">
      <div className="px-[5rem] py-[3rem] border rounded-[25px] bg-black text-white col-span-2 h-[100%] shadow-2xl hover:scale-103 transition-all duration-500 max-6xl:col-span-1">
        <AnimatedSectionText
          heading={content.head}
          paragraphs={[content.text]}
        />
      </div>
      <IntroSecond content={content.cta} />
    </section>
  );
}
