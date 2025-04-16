"use client";
import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";
import { uploadFileWithCustomName } from "@/app/lib/fileUploadHelper"; // Adjust the path as needed
import Button from "../Button";

export default function JobApplicationModal({ job, onClose }) {
  const formRef = useRef(null);
  const recaptchaRef = useRef(null);

  const [status, setStatus] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [file, setFile] = useState(null);

  // Pull these from your .env like in ContactForm
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_CAREERS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const onRecaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaValue) {
      setStatus("Please complete the reCAPTCHA challenge.");
      return;
    }

    // Gather form data
    const formData = new FormData(formRef.current);
    const userName = formData.get("fullName") || "anonymous"; // fallback if not provided

    let fileUrl = "";
    if (file) {
      setStatus("Uploading file...");
      fileUrl = await uploadFileWithCustomName(file, userName);
      if (!fileUrl) {
        setStatus("Failed to upload file. Please try again.");
        return;
      }
      // Add hidden input so EmailJS can include the file URL
      const fileUrlInput = document.createElement("input");
      fileUrlInput.setAttribute("type", "hidden");
      fileUrlInput.setAttribute("name", "fileUrl");
      fileUrlInput.setAttribute("value", fileUrl);
      formRef.current.appendChild(fileUrlInput);

      // Remove the file input (so we don't send the actual file blob to EmailJS)
      const fileInput = formRef.current.querySelector(
        'input[type="file"][name="resume"]'
      );
      if (fileInput) {
        fileInput.remove();
      }
    }

    setStatus("Sending...");
    emailjs.sendForm(serviceId, templateId, formRef.current, publicKey).then(
      () => {
        setStatus("Message sent successfully!");
        setIsSubmitted(true);
        formRef.current.reset();
        recaptchaRef.current.reset();
        setCaptchaValue("");
        setFile(null);
      },
      (error) => {
        console.error("EmailJS error:", error);
        setStatus("Failed to send message. Please try again.");
      }
    );
  };

  const getStatusColor = () => {
    if (status === "Message sent successfully!") return "text-green-500";
    if (
      status === "Failed to send message. Please try again." ||
      status === "Please complete the reCAPTCHA challenge."
    ) {
      return "text-gray-500";
    }
    if (status === "Sending..." || status === "Uploading file...") {
      return "text-blue-500";
    }
    return "text-black";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xl">
      {/* Modal Container */}
      <div className="relative bg-white rounded-[25px] w-[80%] max-w-[1000px] p-[3rem]">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-5xl font-bold cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[80vh] pr-[1rem]">
          {/* Job Info */}
          <h2 className="text-[3rem] font-bold mb-[2rem]">{job.position}</h2>

          <div className="text-[1.6rem] mb-[2rem]">
            <p>
              <strong>Location:</strong> {job.location}
            </p>
            <p>
              <strong>Date Posted:</strong> {job.created_at}
            </p>

            <p className="mt-4">
              <strong>Description:</strong>
            </p>
            <p className="mt-2">{job.description}</p>

            <p className="mt-4">
              <strong>Key Responsibilities:</strong>
            </p>
            <ul className="list-disc list-inside">
              {job.keyResponsibilities?.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>

            <p className="mt-4">
              <strong>Qualifications:</strong>
            </p>
            <ul className="list-disc list-inside">
              {job.qualifications?.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>

            <p className="mt-4">
              <strong>What We Offer:</strong>
            </p>
            <ul className="list-disc list-inside">
              {job.whatWeOffer?.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>

          {/* Application Form Container (relative for overlay) */}
          <div className="relative">
            {/* Status Overlay */}
            {status && (
              <div
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-[2rem] py-[1rem] rounded-full bg-white shadow-lg ${getStatusColor()}`}
                style={{ zIndex: 999 }}
              >
                <p className="text-[2rem]">{status}</p>
              </div>
            )}

            {/* Application Form */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="relative space-y-4 border px-[2rem] py-[2rem] rounded-[25px] overflow-hidden"
            >
              {/* Hidden input to identify which job they're applying for */}
              <input type="hidden" name="jobTitle" value={job.position} />

              {/* Full Name */}
              <div className="flex flex-col">
                <label htmlFor="fullName" className="mb-1 text-[1.8rem]">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  className="border border-gray-300 rounded-xl py-2 px-4 text-[1.6rem] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-1 text-[1.8rem]">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="border border-gray-300 rounded-xl py-2 px-4 text-[1.6rem] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Educational Background */}
              <div className="flex flex-col">
                <label htmlFor="education" className="mb-1 text-[1.8rem]">
                  Educational Background
                </label>
                <select
                  id="education"
                  name="education"
                  required
                  className="border border-gray-300 rounded-xl py-2 px-4 text-[1.6rem] focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select one</option>
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="Certified">Certified</option>
                </select>
              </div>

              {/* Years of Experience */}
              <div className="flex flex-col">
                <label htmlFor="experience" className="mb-1 text-[1.8rem]">
                  Years of Experience
                </label>
                <select
                  id="experience"
                  name="experience"
                  required
                  className="border border-gray-300 rounded-xl py-2 px-4 text-[1.6rem] focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select years</option>
                  {Array.from({ length: 40 }, (_, i) => i + 1).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qatar Driving License */}
              <div className="flex flex-col">
                <label htmlFor="drivingLicense" className="mb-1 text-[1.8rem]">
                  Qatar Driving License
                </label>
                <select
                  id="drivingLicense"
                  name="drivingLicense"
                  required
                  className="border border-gray-300 rounded-xl py-2 px-4 text-[1.6rem] focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select one</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Current Location */}
              <div className="flex flex-col">
                <label htmlFor="currentLocation" className="mb-1 text-[1.8rem]">
                  Current Location
                </label>
                <input
                  type="text"
                  id="currentLocation"
                  name="currentLocation"
                  required
                  className="border border-gray-300 rounded-xl py-2 px-4 text-[1.6rem] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* CV Upload */}
              <div className="flex flex-col">
                <label htmlFor="resume" className="mb-1 text-[1.8rem]">
                  Upload Your CV
                </label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf, .doc, .docx"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="border border-gray-300 rounded-xl py-2 px-4 text-[1.6rem] focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Message Field */}
              <div className="flex flex-col">
                <label htmlFor="message" className="mb-1 text-[1.8rem]">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="border border-gray-300 rounded-xl py-2 px-4 text-[1.6rem] focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              {/* reCAPTCHA */}
              <ReCAPTCHA
                sitekey={recaptchaSiteKey}
                onChange={onRecaptchaChange}
                ref={recaptchaRef}
                className="my-4"
              />

              {/* Submit Button */}
              <Button
                text="Submit Application"
                disabled={
                  isSubmitted ||
                  status === "Sending..." ||
                  status === "Uploading file..."
                }
                textSize="2rem"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
