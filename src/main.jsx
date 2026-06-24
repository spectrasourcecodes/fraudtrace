import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

// Fonts
const fontLink = document.createElement("link");

fontLink.rel = "stylesheet";

fontLink.href =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap";

document.head.appendChild(fontLink);

// Theme
document.documentElement.classList.add("dark");
document.documentElement.classList.add("theme-dark");

// Version
const APP_VERSION = "1.0.0";

console.log(
  `%c🚀 Fraud Trace Recovery %cv${APP_VERSION}`,
  "color:#06b6d4;font-size:18px;font-weight:bold;",
  "color:#94a3b8"
);

// Global Error Handling
window.addEventListener("error", (event) => {
  console.error("❌ Global Error:", event.error);
});

window.addEventListener(
  "unhandledrejection",
  (event) => {
    console.error(
      "❌ Promise Rejection:",
      event.reason
    );
  }
);

// Root Check
const rootElement =
  document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Root element not found."
  );
}

// Render App
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

//
// ==========================
// PWA DEBUGGING
// ==========================
//

console.log("🔍 PWA Debug Started");

window.addEventListener(
  "beforeinstallprompt",
  (event) => {
    console.log(
      "🎉 beforeinstallprompt fired"
    );

    console.log(event);
  }
);

window.addEventListener(
  "appinstalled",
  () => {
    console.log(
      "✅ PWA installed successfully"
    );
  }
);

//
// ==========================
// SERVICE WORKER
// ==========================
//

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      console.log('Registering SW...');

      const registration =
        await navigator.serviceWorker.register('/sw.js');

      console.log(
        '✅ SW Registered:',
        registration.scope
      );

      await navigator.serviceWorker.ready;

      console.log('✅ SW Ready');
    } catch (err) {
      console.error(
        '❌ SW Registration Failed'
      );

      console.error(err);
    }
  });
}

//
// ==========================
// ONLINE / OFFLINE
// ==========================
//

window.addEventListener(
  "online",
  () => {
    console.log("🌐 Online");

    document.body.classList.remove(
      "offline"
    );
  }
);

window.addEventListener(
  "offline",
  () => {
    console.log("📡 Offline");

    document.body.classList.add(
      "offline"
    );
  }
);

//
// ==========================
// VISIBILITY
// ==========================
//

document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden) {
      console.log(
        "👁️ App Hidden"
      );
    } else {
      console.log(
        "👁️ App Visible"
      );
    }
  }
);

console.log("✅ Application Initialized");