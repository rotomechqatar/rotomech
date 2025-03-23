import animationData from "@/animations/drive.json";
import LottieAnimation from "../LottieAnimation";

export default function Location({ content }) {
  return (
    <section className="px-[15rem] mt-[5rem] mb-[10rem] grid grid-cols-3 gap-[5rem]  max-14xl:px-[10rem] max-11xl:h-[50vh] max-9xl:grid-cols-1 max-9xl:h-[65vh] max-6xl:px-[5rem]">
      <div className="h-[30vh] ">
        <LottieAnimation animationData={animationData} />
      </div>
      <div className="col-span-2 rounded-[25px] overflow-hidden max-9xl:h-[30vh] shadow-2xl hover:scale-103 transition-all duration-500">
        <iframe
          title="Our Location"
          src={content.location}
          loading="lazy"
          allowFullScreen
          width="100%"
          height="100%"
          className="hover:scale-105 transition-all duration-300"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </section>
  );
}
