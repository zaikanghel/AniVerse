import { useEffect, useState } from "react";

const ExoStickyBanner = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth > 728);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    if (isDesktop) {
      // Desktop version
      const scriptId = "exoclick-provider-script";
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://a.magsrv.com/ad-provider.js";
        script.async = true;
        document.head.appendChild(script);
      }

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

        const pushScript = document.createElement("script");
        pushScript.innerHTML = '(AdProvider = window.AdProvider || []).push({"serve": {}});';
        container.appendChild(pushScript);
      }
    } else {
      // Mobile version (simple inline insert)
      const container = document.getElementById("exo-ad-container");
      if (container && !container.hasChildNodes()) {
        const script = document.createElement("script");
        script.src = "https://a.magsrv.com/ad-provider.js";
        script.async = true;

        const ins = document.createElement("ins");
        ins.className = "eas6a97888e10";
        ins.setAttribute("data-zoneid", "5593242");
        ins.setAttribute("data-keywords", "keywords");
        ins.setAttribute("data-sub", "123450000");

        const pushScript = document.createElement("script");
        pushScript.innerHTML = '(AdProvider = window.AdProvider || []).push({"serve": {}});';

        container.appendChild(script);
        container.appendChild(ins);
        container.appendChild(pushScript);
      }
    }
  }, [isDesktop]);

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
