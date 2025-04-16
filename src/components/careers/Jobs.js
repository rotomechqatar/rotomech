"use client";
import { useState } from "react";
import Button from "../Button";
import JobApplicationModal from "./JobApplicationModal";

export default function Jobs({ careers, noCareer }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApplyNowClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    console.log("Job clicked:", job);
  };

  const closeModal = () => {
    setSelectedJob(null);
    setIsModalOpen(false);
  };

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
                {/* 
                  If "description" is comma-separated and you want bullets:
                  item.description.split(",").map(...) 
                */}
                <ul className="list-disc list-inside text-[1.6rem] mt-2">
                  {item.description.split(",").map((desc, i) => (
                    <li key={i}>{desc.trim()}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[2rem] font-bold">Location</span>
                <p className="text-[1.6rem]">{item.location}</p>
              </div>

              <div>
                <span className="text-[2rem] font-bold">Date Posted</span>
                <p className="text-[1.6rem]">{item.created_at}</p>
              </div>

              <div className="w-[20rem] self-end">
                <Button
                  text="Apply Now"
                  textSize="2rem"
                  onClick={() => handleApplyNowClick(item)}
                />
              </div>
            </div>
          </div>
        ))
      ) : (
        <h2 className="text-center text-[3rem] w-full col-span-2">
          {noCareer}
        </h2>
      )}

      {/* The Modal — only rendered when isModalOpen is true */}
      {isModalOpen && selectedJob && (
        <JobApplicationModal job={selectedJob} onClose={closeModal} />
      )}
    </section>
  );
}
