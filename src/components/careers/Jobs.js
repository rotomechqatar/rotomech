import Button from "../Button";

export default function Jobs({ careers, noCareer }) {
  return (
    <section className="px-[15rem] py-[10rem] grid grid-cols-2 gap-[5rem] max-14xl:px-[10rem] max-9xl:grid-cols-1 max-6xl:px-[5rem]">
      {careers.length > 0 ? (
        careers.map((item, index) => (
          <div
            key={index}
            className="relative w-full group shadow-xl rounded-[25px]"
          >
            {/* Gradient Border Overlay */}
            <div className="absolute -inset-0.5 rounded-[25px] bg-gradient-to-r from-green to-blue opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
            <div className="relative border flex flex-col gap-[3rem] px-[5rem] py-[5rem] rounded-[25px] transition-all duration-500 hover:scale-103 hover:bg-black hover:text-white">
              <h2 className="text-[3rem] font-bold">{item.position}</h2>
              <div>
                <span className="text-[2rem] font-bold">Description</span>
                <p className="text-[1.6rem]">{item.description}</p>
              </div>
              <div>
                <span className="text-[2rem] font-bold">Requirements</span>
                <p className="text-[1.6rem]">{item.requirements}</p>
              </div>
              <div>
                <span className="text-[2rem] font-bold">Date Posted</span>
                <p className="text-[1.6rem]">{item.created_at}</p>
              </div>
              <div className="w-[20rem] self-end">
                <Button text="Apply Now" textSize="2rem" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <h2 className="text-center text-[3rem] w-[100%] col-span-2">
          {noCareer}
        </h2>
      )}
    </section>
  );
}
