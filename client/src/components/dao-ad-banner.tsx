import { useEffect } from "react";

const DaoAdBanner = () => {
  useEffect(() => {
    const initAd = () => {
      if (typeof window.DaoNativeTeaser === "function") {
        const dnObj = new window.DaoNativeTeaser({ sourceId: 57379, fontSize: "normal" });
        dnObj.add("s57379p5742", {
          count: 3,
          titleColor: "#868585",
          textColor: "#868585",
          hoverColor: "#2b397b",
          cols: 3,
          mobCount: 2,
          imageRatio: 1.333333,
          imageFillMode: "fill",
        });
        dnObj.run();
        return true;
      }
      return false;
    };

    const loadScript = () => {
      const script = document.createElement("script");
      script.id = "dao-native-script";
      script.src = "https://native-cdn.com/d-native-teaser.js?b=31";
      script.async = true;
      document.head.appendChild(script);
    };

    if (!document.getElementById("dao-native-script")) {
      loadScript();
    }

    const interval = setInterval(() => {
      const initialized = initAd();
      if (initialized) clearInterval(interval);
    }, 100); // retry every 100ms

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "transparent",
        zIndex: 9999,
        padding: "10px 0",
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div id="s57379p5742" />
    </div>
  );
};

export default DaoAdBanner;