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
    <div className="flex justify-between items-center w-full px-[10rem] py-[3rem]">
      <Logo />
      <ul className="flex justify-center items-center gap-[2rem] text-[2rem] font-[500]">
        {content.menu.map((item, index) => (
          <li
            key={index}
            className="cursor-pointer group relative inline-block"
          >
            <Link
              href={item.link}
              className="transition-all duration-500 hover:scale-105 hover:text-blue"
            >
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
