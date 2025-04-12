// "use client";
//
// import Image from "next/image";
//
// export default function DirectorMessageSlideUp({ content }) {
//   return (
//     <section className="relative p-8 overflow-hidden bg-white text-gray-800 pt-[5rem] pb-[15rem] max-13xl:pt-[3rem] max-13xl:pb-[10rem] max-11xl:pb-[5rem]">
//       {/* Director's Message using GlassCard */}
//       <GlassCard
//         heading={content.head}
//         paragraph={`${content.quote} - ${content.author}`}
//         starter={content.start}
//       />
//     </section>
//   );
// }
//
// const GlassCard = ({ heading, paragraph, starter }) => {
//   return (
//     <div className="glass-card">
//       <span></span>
//       <div className="content">
//         {/* Starter text + logo */}
//         <div className="starter-wrapper">
//           <h4>{starter}</h4>
//           <Image
//             src="/images/rotomech-logo.png"
//             alt="Logo"
//             width={200}
//             height={200}
//             className="starter-logo"
//           />
//         </div>
//
//         {/* Director's heading + message */}
//         <h2>{heading}</h2>
//         <p>{paragraph}</p>
//       </div>
//
//       <style jsx>{`
//         :root {
//           --ui-blue: #2f80ed;
//           --ui-green: #56ccf2;
//         }
//
//         .glass-card {
//           position: relative;
//           margin: 40px 15rem;
//           padding: 2rem;
//           cursor: pointer;
//           transition: 0.5s;
//           min-height: 400px;
//         }
//
//         /* Pseudo elements for the animated background effect */
//         .glass-card span {
//           display: block;
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           z-index: 5;
//           pointer-events: none;
//         }
//         .glass-card span::before,
//         .glass-card span::after {
//           content: "";
//           position: absolute;
//           top: 0;
//           left: 50px;
//           width: 50%;
//           height: 100%;
//           background: linear-gradient(315deg, var(--ui-blue), var(--ui-green));
//           border-radius: 8px;
//           transform: skewX(15deg);
//           transition: 0.5s;
//         }
//         .glass-card span::after {
//           filter: blur(30px);
//         }
//         .glass-card:hover span::before,
//         .glass-card:hover span::after {
//           transform: skewX(0deg);
//           left: 20px;
//           width: calc(100% - 90px);
//         }
//
//         /* Content container with glassmorphism */
//         .content {
//           position: relative;
//           z-index: 10;
//           padding: 40px 60px;
//           background: rgba(255, 255, 255, 0.05);
//           backdrop-filter: blur(10px);
//           border-radius: 8px;
//           box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
//           transition: 0.5s;
//           color: #fff;
//           text-align: left;
//         }
//         .glass-card:hover .content {
//           transform: translateX(-25px);
//           padding: 60px 80px;
//         }
//
//         /* Starter wrapper for the starter text and logo */
//         .starter-wrapper {
//           display: flex;
//           justify-content: space-around;
//           align-items: center;
//           gap: 1rem;
//           height: 100%;
//         }
//
//         /* Starter text styling */
//         .content h4 {
//           display: block;
//           font-size: 5em;
//           margin: 0;
//           width: 30%;
//           text-align: center;
//         }
//
//         /* Initially hide director's message on desktop */
//         .content h2,
//         .content p {
//           opacity: 0;
//           transition: opacity 0.5s;
//         }
//         .glass-card:hover .starter-wrapper {
//           display: none;
//         }
//         .glass-card:hover .content h2,
//         .glass-card:hover .content p {
//           opacity: 1;
//         }
//
//         h2 {
//           font-size: 4em;
//           margin-bottom: 15px;
//         }
//         p {
//           font-size: 2em;
//           line-height: 1.6em;
//           margin-bottom: 15px;
//         }
//
//         @media (max-width: 1100px) {
//           .glass-card {
//             margin: 20px 0.5rem;
//             padding: 2rem;
//             min-height: auto;
//           }
//
//           /* Apply the hover styles by default */
//           .content {
//             transform: translateX(-25px);
//             padding: 30px 40px;
//           }
//           .content h2,
//           .content p {
//             opacity: 1;
//           }
//
//           /* Hide the entire starter wrapper (starter text and logo) */
//           .starter-wrapper {
//             display: none;
//           }
//
//           /* Make the gradient background span full width without hover */
//           .glass-card span::before,
//           .glass-card span::after {
//             left: 0;
//             width: 100%;
//             transform: none;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

"use client";

export default function DirectorMessageSlideUp({ content }) {
  return (
    <section className="relative p-8 overflow-hidden bg-white text-gray-800 pt-[5rem] pb-[5rem] max-13xl:pt-[3rem] max-13xl:pb-[10rem] max-11xl:pb-[5rem]">
      {/* Director's Message using GlassCard */}
      <GlassCard
        initialHeading={content.start}
        heading={content.head}
        paragraph={`${content.quote} - ${content.author}`}
      />
    </section>
  );
}

const GlassCard = ({ heading, paragraph, initialHeading }) => {
  return (
    <div className="glass-card">
      <span></span>
      <div className="content">
        {/* Director's heading + message */}
        <h3 className="text-[2rem]">{initialHeading}</h3>
        <h2>{heading}</h2>
        <p>{paragraph}</p>
      </div>

      <style jsx>{`
        :root {
          --ui-blue: #2f80ed;
          --ui-green: #56ccf2;
        }

        .glass-card {
          position: relative;
          margin: 40px 15rem;
          padding: 2rem;
          min-height: 300px;
          transition: 0.5s;
        }

        /* Animated background effect always in active state */
        .glass-card span {
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 5;
          pointer-events: none;
        }
        .glass-card span::before,
        .glass-card span::after {
          content: "";
          position: absolute;
          top: 0;
          left: 20px;
          width: calc(100% - 90px);
          height: 100%;
          background: linear-gradient(315deg, var(--ui-blue), var(--ui-green));
          border-radius: 8px;
          transform: skewX(0deg);
          transition: 0.5s;
        }
        .glass-card span::after {
          filter: blur(30px);
        }

        /* Content container styled in the active state */
        .content {
          position: relative;
          z-index: 10;
          padding: 60px 80px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transform: translateX(-25px);
          transition: 0.5s;
          color: #fff;
          text-align: left;
        }

        .content h2,
        .content p {
          opacity: 1;
          transition: opacity 0.5s;
        }

        h2 {
          font-size: 4em;
          margin-bottom: 15px;
        }
        p {
          font-size: 2em;
          line-height: 1.6em;
          margin-bottom: 15px;
        }

        @media (max-width: 1100px) {
          .glass-card {
            margin: 20px 0.5rem;
            padding: 2rem;
            min-height: auto;
          }

          .content {
            transform: translateX(-25px);
            padding: 30px 40px;
          }

          .glass-card span::before,
          .glass-card span::after {
            left: 0;
            width: 100%;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};
