import animationData from "@/animations/drive.json";
import LottieAnimation from "../LottieAnimation";

export default function Location({ content }) {
  return (
    <section className="px-[15rem] mt-[5rem] mb-[10rem] grid grid-cols-3 gap-[5rem]">
      <div>
        <LottieAnimation animationData={animationData} />
      </div>
      <div className="col-span-2 rounded-[25px] overflow-hidden">
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
