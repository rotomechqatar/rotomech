import fs from "fs/promises";
import Link from "next/link";
import path from "path";
import Logo from "../Logo";
import Button from "../Button";

export default async function Header() {
  const filePath = path.join(process.cwd(), "src/data", "header.json");
  const data = await fs.readFile(filePath, "utf8");
  const content = JSON.parse(data);

  return (
    <div className="relative z-50 bg-black backdrop-blur-md flex justify-between items-center px-[15rem] py-[2rem] shadow-lg text-white">
      <Logo />
      <ul className="flex justify-center items-center gap-[2rem] text-[2rem] font-[500]">
        {content.menu.map((item, index) => (
          <li
            key={index}
            className="cursor-pointer group relative inline-block hover:scale-105 transition-all duration-300"
          >
            <Link href={item.link} className="transition-all duration-500 ">
              {item.name}
            </Link>
            <span className="absolute left-1/2 bottom-0 h-[2px] w-0 bg-green transition-all duration-500 group-hover:w-full group-hover:-translate-x-1/2"></span>
          </li>
        ))}
        <a
          href={content.profile}
          target="_blank"
          rel="noopener noreferrer"
          className="pl-[2rem]"
        >
          <Button text="Company Profile" />
        </a>
      </ul>
    </div>
  );
}
