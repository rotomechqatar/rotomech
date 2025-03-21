import Image from "next/image";

export default function Logo({ type }) {
  return (
    <div
      className={`relative ${
        type === "footer" ? "h-[10rem] w-[10rem]" : "h-[5rem] w-[5rem]"
      }`}
    >
      <Image
        src="/images/rotomech-logo.png"
        className="object-contain"
        alt="logo-image-rotomech-international"
        fill
      />
    </div>
  );
}
