import AnimatedSectionText from "@/components/AnimatedSectionText";
import Image from "next/image";

export default function WhyChooseUs({ content }) {
  return (
    <section className="px-[15rem] py-[5rem] flex justify-center items-center gap-[5rem] max-9xl:flex-col max-6xl:px-[5rem]">
      <div className="relative h-[30rem] w-[30%] rounded-[25px] overflow-hidden max-9xl:w-[100%]">
        <Image
          alt={content.alt}
          src={content.image}
          className="object-cover rounded-[25px] hover:scale-105 transition-all duration-300 ease-in-out"
          fill
        />
      </div>
      <div className="w-[70%] max-9xl:w-[100%]">
        <AnimatedSectionText
          heading={content.head}
          paragraphs={[content.text]}
        />
      </div>
    </section>
  );
}
