import fs from "fs/promises";
import path from "path";
import Logo from "../Logo";
import Link from "next/link";
import Image from "next/image";

export default async function Footer() {
  const filePath = path.join(process.cwd(), "src/data", "footer.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);
  return (
    <div className="bg-black text-white grid grid-cols-3 px-[15rem] py-[5rem] max-11xl:px-[10rem] max-6xl:px-[5rem] max-8xl:grid-cols-2 max-6xl:grid-cols-1 max-6xl:gap-[2rem]">
      <div className="flex flex-col gap-[2rem] max-8xl:items-center">
        <Logo type="footer" />
        <p className="text-[1.5rem] w-[50%] max-8xl:w-[80%] max-8xl:text-center">
          {content.address}
        </p>
        <ul className="flex gap-[1rem]">
          {content.contacts.map((item, index) => (
            <li key={index}>
              <Link href={item.link} target="_blank" rel="noopener noreferrer">
                <img
                  src={item.icon}
                  alt={item.name}
                  className="h-[5rem] w-[5rem] p-[1rem] border rounded-full hover:scale-115 cursor-pointer transition-all duration-300"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex flex-col justify-center gap-[1rem] text-[2rem] max-8xl:grid max-8xl:grid-cols-3 max-8xl:gap-0 max-8xl:items-center max-6xl:grid-cols-6 max-6xl:row-start-1 max-6xl:mx-auto max-5xl:grid-cols-3 max-5xl:gap-[1rem]">
        {content.menu.map((item, index) => (
          <li
            key={index}
            className="cursor-pointer group inline-block hover:scale-105 transition-all duration-300"
          >
            <div className="relative inline-block">
              <Link href={item.link} className="transition-all duration-500">
                {item.name}
              </Link>
              <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-green transition-all duration-500 group-hover:w-full"></span>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-[25px] overflow-hidden max-8xl:col-span-2 max-8xl:mt-[3rem] max-6xl:col-span-1">
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
    </div>
  );
}
