import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import Run from "./page/runs.jsx";
import FearLadder from "./page/FearLadder.jsx";
import FearRecord from "./page/FearRecord.jsx";
import SpeedLadder from "./page/SpeedLadder.jsx";
import SpeedRecord from "./page/SpeedRecord.jsx";

import ArcanaVow from "./page/ArcanaVow.jsx";
import BiomeMap from "./page/BiomeMap.jsx";

import Stats from "./page/Stats.jsx";
import FirstMaxFear from "./page/FirstMaxFear.jsx";

import Submit from "./page/Submit.jsx";
// Hooks
import { DataProvider } from "./hooks/DataFetch.jsx";
import { PfpProvider } from "./hooks/PfpFetch.jsx";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PfpProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/Run" element={<Run />} />
            <Route path="/FearLadder" element={<FearLadder />} />
            <Route path="/FearRecord" element={<FearRecord />} />

            <Route path="/SpeedLadder" element={<SpeedLadder />} />
            <Route path="/SpeedRecord" element={<SpeedRecord />} />

            <Route path="/Stats" element={<Stats />} />
            <Route path="/FirstMaxFear" element={<FirstMaxFear />} />

            <Route path="/ArcanaVow" element={<ArcanaVow />} />
            <Route path="/BiomeMap" element={<BiomeMap />} />

            <Route path="/Submit" element={<Submit />} />
          </Routes>
        </Router>
      </DataProvider>
    </PfpProvider>
  </StrictMode>,
);
