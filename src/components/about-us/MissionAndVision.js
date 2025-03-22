import AnimatedSectionText from "../AnimatedSectionText";

export default function MissionAndVision({ mission, vision }) {
  return (
    <section className="px-[15rem] pb-[10rem] flex gap-[5rem] max-15xl:px-[10rem] max-9xl:flex-col max-6xl:px-[5rem]">
      {/* Mission Card */}
      <div className="relative w-[90%] group shadow-xl rounded-[25px] max-9xl:w-[100%]">
        {/* Gradient Border Overlay */}
        <div className="absolute -inset-0.5 rounded-[25px] bg-gradient-to-r from-green to-blue opacity-0 group-hover:opacity-100 group-hover:scale-108 transition-all duration-500 " />
        <div className="relative border h-[300px] hover:scale-105 hover:bg-black hover:text-white px-[3rem] py-[2rem] rounded-[25px] transition-all duration-500 max-9xl:h-[200px] max-6xl:flex max-6xl:flex-col max-6xl:justify-center">
          <AnimatedSectionText
            heading={mission.head}
            paragraphs={[mission.text]}
          />
        </div>
      </div>

      {/* Vision Card */}
      <div className="relative w-[90%] group shadow-xl rounded-[25px] max-9xl:w-[100%]">
        {/* Gradient Border Overlay */}
        <div className="absolute -inset-0.5 rounded-[25px] bg-gradient-to-r from-green to-blue opacity-0 group-hover:opacity-100 group-hover:scale-108 transition-all duration-500" />
        <div className="relative border h-[300px] hover:scale-105 hover:bg-black hover:text-white px-[3rem] py-[2rem] rounded-[25px] transition-all duration-500 max-9xl:h-[200px] max-6xl:flex max-6xl:flex-col max-6xl:justify-center">
          <AnimatedSectionText
            heading={vision.head}
            paragraphs={[vision.text]}
          />
        </div>
      </div>
    </section>
  );
}
