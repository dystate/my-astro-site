import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MobileLogApp from "./MobileLogApp";
import "./mobile.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MobileLogApp />
  </StrictMode>,
);
