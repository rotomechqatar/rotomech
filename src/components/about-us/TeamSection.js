import Image from "next/image";

export default function TeamSection({ content }) {
  console.log(content);

  const { name, title, image } = content.director;

  return (
    <div className="grid grid-cols-4 gap-[5rem] px-[20rem] pt-[10rem] pb-[5rem] max-15xl:px-[15rem] max-12xl-px-[10rem] max-6xl:px-[5rem] max-9xl:flex max-9xl:flex-col max-9xl:gap-[2rem] max-6xl:pt-[5rem]">
      <div className="flex flex-col items-center justify-center col-span-1">
        <div className="relative h-[40rem] w-full overflow-hidden rounded-[25px] mb-[1rem] shadow-2xl max-9xl:h-[60rem] max-9xl:w-full">
          <Image
            src={image}
            alt="Director's Iamge"
            className="object-cover object-top hover:scale-105 transition-all duration-300 max-9xl:object-contain max-6xl:object-cover"
            fill
          />
        </div>
        <h2 className="text-[3rem]">{name}</h2>
        <h3 className="text-[2rem]">{title}</h3>
      </div>
      <div className="col-span-3">
        <div className=" relative h-[40rem] w-full rounded-[25px] overflow-hidden shadow-2xl">
          <Image
            src={content.teamImage}
            alt="Image of our Team"
            className="object-cover object-top hover:scale-105 transition-all duration-300"
            fill
          />
        </div>
        <h2 className="text-center mt-[2rem] text-[3rem]">Our Team</h2>
      </div>
    </div>
  );
}
