"use client";

export default function AnimatedText({ text, className = "" }) {
  // Split text by spaces to animate each word.
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        <span
          key={index}
          className="word"
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          {word}&nbsp;
        </span>
      ))}
      <style jsx>{`
        .word {
          display: inline-block;
          opacity: 0;
          transform: translateY(80px);
          animation: reveal 0.8s forwards;
        }
        @keyframes reveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </span>
  );
}
