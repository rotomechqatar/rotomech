import Button from "@/components/Button";
import Link from "next/link";

export default function CTA({ content }) {
  return (
    <div className="mx-[15rem] my-[5rem] p-[5px] animated-gradient rounded-2xl shadow-2xl max-15xl:mx-[10rem] max-6xl:mx-[5rem]">
      <section className="flex justify-between items-center border border-transparent bg-white px-[3rem] py-[3rem] rounded-2xl max-5xl:flex-col max-5xl:gap-[3rem]">
        <div className="w-[80%] max-6xl:w-[95%] max-5xl:w-[100%]">
          <h3 className="text-[3rem] mb-[2rem]">{content.head}</h3>
          <p className="text-[2rem] w-[90%] max-5xl:w-[100%]">{content.text}</p>
        </div>
        <Link href="/contact-us">
          <Button text="Get in Touch" textSize="2rem" />
        </Link>
      </section>
    </div>
  );
}
