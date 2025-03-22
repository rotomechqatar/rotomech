import React from "react";

const ReversedDropLogo = () => {
  return (
    <div
      style={{
        width: "200px",
        height: "300px",
        /* 
          A simple top-to-bottom gradient for a watery look.
          Adjust colors or add more stops as needed.
        */
        background: "linear-gradient(to bottom, #29abe2, #2db62e)",

        /*
          A smooth “water droplet” path, reversed so the tip is at the bottom.
          Feel free to adjust these cubic Bezier control points to change curvature.
        */
        clipPath:
          'path("M 50% 100% C 80% 70% 80% 20% 50% 0% C 20% 20% 20% 70% 50% 100% Z")',
        WebkitClipPath:
          'path("M 50% 100% C 80% 70% 80% 20% 50% 0% C 20% 20% 20% 70% 50% 100% Z")',
      }}
    />
  );
};

export default ReversedDropLogo;
