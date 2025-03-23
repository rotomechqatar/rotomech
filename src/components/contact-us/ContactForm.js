"use client";
import { useState, useRef, useEffect } from "react";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";
import Button from "../Button";
import ImageCarouselDirection from "../ImageCarouselDirection";

export default function ContactForm({ content }) {
  const formRef = useRef(null);
  const recaptchaRef = useRef(null);

  const [status, setStatus] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
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
    setCaptchaValue(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!captchaValue) {
      setStatus("Please complete the reCAPTCHA challenge.");
      return;
    }

    setStatus("Sending...");

    emailjs.sendForm(serviceId, templateId, formRef.current, publicKey).then(
      () => {
        setStatus("Message sent successfully!");
        setIsSubmitted(true);
        formRef.current.reset();
        recaptchaRef.current.reset(); // Reset reCAPTCHA
        setCaptchaValue("");
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
    if (status === "Sending...") return "text-blue-500";
    return "text-black";
  };

  return (
    <section className="px-[15rem] mt-[5rem] my-[10rem] grid grid-cols-2 justify-between items-start relative max-16xl:gap-[5rem] max-11xl:grid-cols-1 max-14xl:px-[10rem] max-11xl:grid-rows-2 max-6xl:px-[5rem]">
      {/* Form column */}
      <div className="relative w-[80%] mx-auto shadow-2xl hover:skew-1 rounded-[25px] transition-all duration-500 max-16xl:w-[100%]">
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
            disabled={isSubmitted || status === "Sending..."}
            textSize="2rem"
          />
        </form>
      </div>

      {/* Carousel column */}
      <div className="h-[100%] w-[70%] rounded-[25px] overflow-hidden mx-auto shadow-2xl hover:scale-103 transition-all duration-500 max-16xl:w-[100%]">
        <ImageCarouselDirection images={content} />
      </div>
    </section>
  );
}
