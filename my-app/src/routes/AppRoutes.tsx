import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Propietarios from "../pages/Propietarios";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/propietarios" element={<Propietarios />} />
    </Routes>
  );
}

export default AppRoutes;
