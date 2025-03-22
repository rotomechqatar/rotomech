import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import Logo from "../Logo";
import Button from "../Button";
import MobileMenu from "./MobileMenu"; // Adjust if needed

export default async function Header() {
  const filePath = path.join(process.cwd(), "src/data", "header.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);

  return (
    <div className="absolute w-[90%] top-0 left-0 right-0 z-50 bg-black backdrop-blur-md flex justify-between items-center px-[10rem] py-[2rem] mx-auto my-[2rem] rounded-[25px] shadow-lg text-white max-14xl:px-[10rem] max-6xl:px-[2rem] overflow-hidden">
      {/* Left side: Logo (always visible) */}
      <Logo />

      <div className="max-9xl:hidden flex items-center gap-[2rem]">
        <ul className="flex justify-center items-center gap-[2rem] text-[2rem] font-[500] max-16xl:text-[1.5rem]">
          {content.menu.map((item, index) => (
            <li
              key={index}
              className="cursor-pointer group relative inline-block hover:scale-105 transition-all duration-300"
            >
              <Link href={item.link} className="transition-all duration-500">
                {item.name}
              </Link>
              <span className="absolute left-1/2 bottom-0 h-[2px] w-0 bg-green transition-all duration-500 group-hover:w-full group-hover:-translate-x-1/2"></span>
            </li>
          ))}
        </ul>
        <a
          href={content.profile}
          target="_blank"
          rel="noopener noreferrer"
          className="pl-[2rem]"
        >
          <Button text="Company Profile" textSize="2rem" />
        </a>
      </div>

      {/* 
        Mobile Menu + Button
        Hidden above 900px (shown below) => hidden max-9xl:flex
      */}
      <div className="hidden max-9xl:flex items-center gap-[2rem]">
        <a href={content.profile} target="_blank" rel="noopener noreferrer">
          <Button text="Company Profile" textSize="2rem" />
        </a>
        <MobileMenu menu={content.menu} />
      </div>
    </div>
  );
}
