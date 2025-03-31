import Image from "next/image";
import ImageCarouselDirection from "../ImageCarouselDirection";
import AnimatedSectionText from "../AnimatedSectionText";

export default function PageIntro({ contnet }) {
  return (
    <section className="flex justify-center items-center gap-[5rem] w-full min-h-[70vh] px-[15rem] pb-[5rem] max-15xl:px-[10rem]  max-9xl:flex-col max-9xl:pt-[10rem] max-6xl:px-[5rem]">
      <div className="h-[50vh] w-[40%] max-9xl:w-[100%] rounded-[25px] overflow-hidden shadow-2xl">
        <ImageCarouselDirection images={contnet.images} />
      </div>

      <div className="w-1/2 max-9xl:w-full py-[4rem] flex flex-col justify-center items-center">
        <AnimatedSectionText
          heading={contnet.head}
          paragraphs={[contnet.text]}
        />
      </div>
    </section>
  );
}
