"use client";
import { useState, useRef } from "react";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";
import NormalImageCarousel from "../NomralImageCarousel";
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
      (result) => {
        setStatus("Message sent successfully!");
        setIsSubmitted(true);
        formRef.current.reset();
        // Reset the recaptcha widget
        recaptchaRef.current.reset();
        setCaptchaValue("");
      },
      (error) => {
        console.error("EmailJS error:", error);
        setStatus("Failed to send message. Please try again.");
      }
    );
  };

  // Returns the appropriate text color class for the status popup
  const getStatusColor = () => {
    if (status === "Message sent successfully!") return "text-green-500";
    if (
      status === "Failed to send message. Please try again." ||
      status === "Please complete the reCAPTCHA challenge."
    )
      return "text-gray-500";
    if (status === "Sending...") return "text-blue-500";
    return "text-black";
  };

  return (
    <section className="px-[15rem] mt-[5rem] my-[10rem] grid grid-cols-2 justify-between items-center relative">
      {status && (
        <div
          className={`absolute top-[-4rem] left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full animated-gradient ${getStatusColor()}`}
        >
          <p className="text-sm">{status}</p>
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="w-[80%] mx-auto space-y-4 border h-[100%] px-[5rem] py-[5rem] rounded-[25px]"
      >
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 text-lg">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="border border-gray-300 rounded-xl py-3 px-4 text-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="email" className="mb-1 text-lg">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="border border-gray-300 rounded-xl py-3 px-4 text-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="number" className="mb-1 text-lg">
            Number
          </label>
          <input
            type="tel"
            id="number"
            name="number"
            required
            className="border border-gray-300 rounded-xl py-3 px-4 text-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="message" className="mb-1 text-lg">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            className="border border-gray-300 rounded-xl py-3 px-4 text-lg focus:outline-none focus:border-blue-500 h-[20rem]"
          ></textarea>
        </div>
        {/* Hidden input to include the reCAPTCHA token */}
        <input type="hidden" name="g-recaptcha-response" value={captchaValue} />
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
        />
      </form>
      <div className="h-[60vh] w-[70%] rounded-[25px] overflow-hidden mx-auto">
        <ImageCarouselDirection images={content} />
      </div>
    </section>
  );
}
