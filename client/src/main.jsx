import React from "react";
import ReactDOM from "react-dom/client";
import { GameStateProvider } from "./context/GameStateContext.jsx";
import App from "./App.jsx";
import "./index.css";

console.log("[Marshrutka] v2.0 booting...");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GameStateProvider>
      <App />
    </GameStateProvider>
  </React.StrictMode>
);