import AnimatedSectionText from "../AnimatedSectionText";
import IntroSecond from "./IntroSecond";

export default function PageIntro({ content }) {
  return (
    <section className="my-[10rem] px-[15rem] grid grid-cols-3 justify-center items-center gap-[5rem]">
      <div className="px-[5rem] py-[3rem] border rounded-[25px] bg-black text-white col-span-2 h-[100%]">
        <AnimatedSectionText
          heading={content.head}
          paragraphs={[content.text]}
        />
      </div>
      <IntroSecond content={content.cta} />
    </section>
  );
}
