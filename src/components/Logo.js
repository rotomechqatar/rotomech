import Image from "next/image";

export default function Logo() {
  return (
    <div className="relative h-[5rem] w-[5rem]">
      <Image
        src="/images/rotomech-logo.png"
        className="object-contain"
        alt="logo-image-rotomech-international"
        fill
      />
    </div>
  );
}
