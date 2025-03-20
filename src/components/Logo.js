import Image from "next/image";

export default function Logo() {
  return (
    <div className="relative h-[8rem] w-[8rem]">
      <Image
        src="/images/rotomech-logo.png"
        className="object-contain"
        alt="logo-image-rotomech-international"
        fill
      />
    </div>
  );
}
