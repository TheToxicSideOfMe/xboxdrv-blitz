import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import MapController from "./pages/MapController";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/map/:controllerId" element={<MapController />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;