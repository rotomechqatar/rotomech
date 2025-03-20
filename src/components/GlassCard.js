const GlassCard = ({ heading, children, background }) => {
  return (
    <div className="glass-card">
      {background && <div className="background">{background}</div>}
      <span></span>
      <div className="content">
        <h2 className="z-[100]">{heading}</h2>
        {children}
      </div>
      <style jsx>{`
        .glass-card {
          position: relative;
          width: 100%;
          height: 100%;
          margin: 40px auto;
          cursor: pointer;
          transition: 0.5s;
        }
        /* Background element behind the content */
        .background {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.1;
        }
        /* Pseudo elements for the animated background effect */
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
          left: 50px;
          width: 50%;
          height: 100%;
          background: linear-gradient(315deg, #ffbc00, #ff0058);
          border-radius: 8px;
          transform: skewX(15deg);
          transition: 0.5s;
        }
        .glass-card span::after {
          filter: blur(30px);
        }
        .glass-card:hover span::before,
        .glass-card:hover span::after {
          transform: skewX(0deg);
          left: 20px;
          width: calc(100% - 90px);
        }
        /* Content container with glassmorphism */
        .content {
          position: relative;
          z-index: 10; /* Ensure the content is on top */
          padding: 20px 40px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: 0.5s;
          color: #fff;
        }
        .glass-card:hover .content {
          transform: translateX(-25px);
          padding: 60px 40px;
        }
        h2 {
          font-size: 2em;
          margin-bottom: 10px;
        }
        p,
        blockquote {
          font-size: 1.1em;
          line-height: 1.4em;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
};

export default GlassCard;
