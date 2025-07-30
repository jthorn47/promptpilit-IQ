import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./core/App";
import "./index.css";

// Import all modules to ensure they register themselves
import "./modules";

createRoot(document.getElementById("root")!).render(
  <App />
);
