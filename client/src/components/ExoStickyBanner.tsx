import { useEffect } from "react";

const ExoStickyBanner = () => {
  useEffect(() => {
    // Add the ad-provider.js script
    const scriptId = "exoclick-provider-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://a.magsrv.com/ad-provider.js";
      script.async = true;
      document.head.appendChild(script);
    }

    // Add the ad ins element
    const ins = document.createElement("ins");
    ins.className = "eas6a97888e17";
    ins.setAttribute("data-zoneid", "5593198");
    ins.setAttribute("data-keywords", "keywords");
    ins.setAttribute("data-sub", "123450000");
    ins.style.display = "block";
    ins.style.textAlign = "center";

    const container = document.getElementById("exo-ad-container");
    if (container && !container.hasChildNodes()) {
      container.appendChild(ins);
    }

    // Trigger the ad script
    const pushScript = document.createElement("script");
    pushScript.innerHTML = '(AdProvider = window.AdProvider || []).push({"serve": {}});';
    container?.appendChild(pushScript);
  }, []);

  return (
    <div
      id="exo-ad-container"
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        zIndex: 9999,
        backgroundColor: "transparent",
        padding: "10px 0",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    />
  );
};

export default ExoStickyBanner;
