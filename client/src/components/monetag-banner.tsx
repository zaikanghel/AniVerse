import { useEffect } from "react";

const MonetagBannerIframe = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "50px", // You can adjust height as needed
        zIndex: 9999,
        border: "none",
        padding: 0,
        margin: 0,
      }}
    >
      <iframe
        src="https://uvoonaix.top/4/9244032" // Replace with your actual SmartLink
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          overflow: "hidden",
        }}
        scrolling="no"
        frameBorder="0"
        title="Monetag Ad"
      ></iframe>
    </div>
  );
};

export default MonetagBannerIframe;