import { useEffect } from "react";

const ExoClickPush = () => {
  useEffect(() => {
    // Prevent duplicate script injection
    if (document.getElementById("exo-push-script")) return;

    // Config script
    const configScript = document.createElement("script");
    configScript.type = "application/javascript";
    configScript.innerHTML = `
      pn_idzone = 5593352;
      pn_sleep_seconds = 0;
      pn_is_self_hosted = 1;
      pn_soft_ask = 0;
      pn_filename = "/worker.js";
    `;
    document.body.appendChild(configScript);

    // Load push script
    const pushScript = document.createElement("script");
    pushScript.id = "exo-push-script";
    pushScript.type = "application/javascript";
    pushScript.src = "https://js.wpnsrv.com/pn.php";
    pushScript.async = true;
    document.body.appendChild(pushScript);
  }, []);

  return null;
};

export default ExoClickPush;
