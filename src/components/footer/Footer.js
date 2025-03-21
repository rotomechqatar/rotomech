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
    <div className="bg-black text-white grid grid-cols-3 px-[15rem] py-[5rem]">
      <div className="flex flex-col gap-[2rem]">
        <Logo type="footer" />
        <p className="text-[1.5rem] w-[50%]">{content.address}</p>
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

      <ul className="flex flex-col justify-center gap-[1rem] text-[2rem]">
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

      <div className="rounded-[25px] overflow-hidden">
        <iframe
          title="Our Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.2742745263745!2d51.49119637593057!3d25.22768543046412!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e45d18046ffba0d%3A0x567fec3d3a15b0e5!2sRotomech%20International!5e0!3m2!1sen!2sqa!4v1742578826557!5m2!1sen!2sqa"
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
