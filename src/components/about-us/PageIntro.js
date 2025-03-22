import Image from "next/image";
import ImageCarouselDirection from "../ImageCarouselDirection";
import AnimatedSectionText from "../AnimatedSectionText";

export default function PageIntro({ contnet }) {
  return (
    <section className="flex justify-center items-center w-full min-h-[80vh] px-[15rem] pb-[5rem] max-15xl:px-[10rem]  max-9xl:flex-col max-6xl:px-[5rem]">
      <div className="h-[40vh] w-[50%] rounded-[25px] overflow-hidden shadow-2xl">
        <ImageCarouselDirection images={contnet.images} />
      </div>

      <div className="w-1/2 max-9xl:w-full p-[4rem] flex flex-col justify-center">
        <AnimatedSectionText
          heading={contnet.head}
          paragraphs={[contnet.text, contnet.text2]}
        />
      </div>
    </section>
  );
}
