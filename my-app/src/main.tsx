import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Counter from "./counter";
import "./style.css";

const root = document.getElementById("app");
if (!root) throw new Error("App element not found");

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <Counter />
    </BrowserRouter>
  </React.StrictMode>
);

