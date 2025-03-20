export default function Button({ text }) {
  return (
    <button className="cursor-pointer relative border border-blue px-[2rem] py-[1rem] text-blue transition-all duration-300 overflow-hidden hover:text-white before:absolute before:z-[-1] before:top-1/2 before:left-1/2 before:w-0 before:h-0 before:bg-gradient-to-r before:from-green before:to-blue before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:w-[300%] hover:before:h-[300%] hover:before:top-1/2 hover:before:left-1/2 hover:before:translate-x-[-50%] hover:before:translate-y-[-50%] hover:scale-105 shadow-sm">
      {text}
    </button>
  );
}
