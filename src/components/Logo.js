import Image from "next/image";
import Link from "next/link";

export default function Logo({ type }) {
  return (
    <div
      className={`relative ${
        type === "footer" ? "h-[12rem] w-[12rem]" : "h-[7rem] w-[7rem]"
      }`}
    >
      <Link href="/">
        <Image
          src="/images/rotomech-logo.png"
          className="object-contain"
          alt="rotomech drop logo"
          fill
        />
      </Link>
    </div>
  );
}
