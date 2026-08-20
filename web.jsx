import React from "react";
import { createRoot } from "react-dom/client";
import Robin from "./karteibox_1.jsx";

// Die App spricht mit window.storage. Im Web liegt das auf localStorage —
// alles bleibt auf dem Geraet, es geht nichts an einen Server.
window.storage = {
  get: async (k) => {
    try { const v = localStorage.getItem(k); return v == null ? null : { value: v }; }
    catch { return null; }
  },
  set: async (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};

createRoot(document.getElementById("root")).render(<Robin />);
