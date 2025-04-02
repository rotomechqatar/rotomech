"use client";
import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";
import Button from "./Button";
import ImageCarouselDirection from "./ImageCarouselDirection";
import { uploadFileWithCustomName } from "@/app/lib/fileUploadHelper";
import LottieAnimation from "./LottieAnimation";
import animationData from "../animations/career.json";

export default function ContactForm({ content, type, page }) {
  const formRef = useRef(null);
  const recaptchaRef = useRef(null);

  const [status, setStatus] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [file, setFile] = useState(null);

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId =
    type === "contact"
      ? process.env.NEXT_PUBLIC_EMAILJS_CONTACT_TEMPLATE_ID
      : process.env.NEXT_PUBLIC_EMAILJS_CAREERS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Hide status automatically after 3 seconds whenever it changes.
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const onRecaptchaChange = (value) => {
    console.log("reCAPTCHA value:", value);
    setCaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaValue) {
      console.error("reCAPTCHA challenge not completed.");
      setStatus("Please complete the reCAPTCHA challenge.");
      return;
    }

    // Get the user name from the form. This will be used in the file name.
    const formData = new FormData(formRef.current);
    const userName = formData.get("name");
    console.log("User name from form:", userName);

    // For careers submissions, if a file was selected, upload it first.
    let fileUrl = "";
    if (type === "careers" && file) {
      setStatus("Uploading file...");
      console.log("Uploading file:", file);
      fileUrl = await uploadFileWithCustomName(file, userName);
      if (!fileUrl) {
        console.error("Failed to get file URL after upload.");
        setStatus("Failed to upload file. Please try again.");
        return;
      }
      console.log("File uploaded successfully. URL:", fileUrl);
      // Append a hidden input with the file URL so EmailJS can include it.
      const fileUrlInput = document.createElement("input");
      fileUrlInput.setAttribute("type", "hidden");
      fileUrlInput.setAttribute("name", "fileUrl");
      fileUrlInput.setAttribute("value", fileUrl);
      formRef.current.appendChild(fileUrlInput);

      // Remove the file input from the form so that EmailJS doesn't include the file blob.
      const fileInput = formRef.current.querySelector(
        'input[type="file"][name="resume"]'
      );
      if (fileInput) {
        fileInput.remove();
      }
    }

    setStatus("Sending...");
    console.log("Sending email with EmailJS...");

    emailjs.sendForm(serviceId, templateId, formRef.current, publicKey).then(
      () => {
        console.log("EmailJS: Message sent successfully!");
        setStatus("Message sent successfully!");
        setIsSubmitted(true);
        formRef.current.reset();
        recaptchaRef.current.reset(); // Reset reCAPTCHA
        setCaptchaValue("");
        setFile(null);
      },
      (error) => {
        console.error("EmailJS error:", error);
        setStatus("Failed to send message. Please try again.");
      }
    );
  };

  // Returns the appropriate Tailwind color class for the status text
  const getStatusColor = () => {
    if (status === "Message sent successfully!") return "text-green-500";
    if (
      status === "Failed to send message. Please try again." ||
      status === "Please complete the reCAPTCHA challenge."
    ) {
      return "text-gray-500";
    }
    if (status === "Sending..." || status === "Uploading file...")
      return "text-blue-500";
    return "text-black";
  };

  return (
    <section className="px-[15rem] mt-[5rem] my-[10rem] grid grid-cols-2 justify-between items-center relative max-16xl:gap-[5rem] max-11xl:grid-cols-1 max-14xl:px-[10rem] max-11xl:grid-rows-2 max-6xl:px-[5rem]">
      {/* Form column */}
      <div className="relative w-[80%] mx-auto shadow-2xl rounded-[25px] transition-all duration-500 max-16xl:w-[100%]">
        {status && (
          <div
            className={`
              absolute top-1/2 left-1/2
              transform -translate-x-1/2 -translate-y-1/2
              px-[2rem] py-[1rem] rounded-full animated-gradient
              bg-white shadow-lg
              ${getStatusColor()}
            `}
            style={{ zIndex: 999 }}
          >
            <p className="text-[2rem]">{status}</p>
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="w-full space-y-4 border px-[5rem] py-[5rem] rounded-[25px] overflow-hidden"
        >
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 text-[2rem]">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="border border-gray-300 rounded-xl py-3 px-4 text-[2rem] focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="mb-1 text-[2rem]">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="border border-gray-300 rounded-xl py-3 px-4 text-[2rem] focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="number" className="mb-1 text-[2rem]">
              Number
            </label>
            <input
              type="tel"
              id="number"
              name="number"
              required
              className="border border-gray-300 rounded-xl py-3 px-4 text-[2rem] focus:outline-none focus:border-blue-500"
            />
          </div>
          {type === "careers" && (
            <>
              <div className="flex flex-col">
                <label htmlFor="resume" className="mb-1 text-[2rem]">
                  Resume / Portfolio
                </label>
                <input
                  type="file"
                  id="resume"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    console.log("File selected:", e.target.files[0]);
                    setFile(e.target.files[0]);
                  }}
                  required
                  className="border border-gray-300 rounded-xl py-3 px-4 text-[2rem] focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}
          <div className="flex flex-col">
            <label htmlFor="message" className="mb-1 text-[2rem]">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              className="border border-gray-300 rounded-xl py-3 px-4 text-[2rem] focus:outline-none focus:border-blue-500 h-[20rem]"
            ></textarea>
          </div>
          {/* Hidden input to include the reCAPTCHA token */}
          <input
            type="hidden"
            name="g-recaptcha-response"
            value={captchaValue}
          />
          <div>
            <ReCAPTCHA
              sitekey={recaptchaSiteKey}
              onChange={onRecaptchaChange}
              ref={recaptchaRef}
            />
          </div>
          <Button
            text="Send Message"
            disabled={
              isSubmitted ||
              status === "Sending..." ||
              status === "Uploading file..."
            }
            textSize="2rem"
          />
        </form>
      </div>

      {type === "contact" ? (
        <div className="h-[100%] w-[70%] rounded-[25px] overflow-hidden mx-auto shadow-2xl hover:scale-103 transition-all duration-500 max-16xl:w-[100%]">
          <ImageCarouselDirection images={content} />
        </div>
      ) : (
        <div className="h-[100%] w-[70%] mx-auto max-16xl:w-[100%]">
          <LottieAnimation animationData={animationData} />
        </div>
      )}
    </section>
  );
}
