import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Propietarios from "../pages/Propietarios";
import Gastos from "../pages/Gastos"; // <-- import Gastos

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/propietarios" element={<Propietarios />} />
      <Route path="/gastos" element={<Gastos />} />  {/* <-- nueva ruta */}
    </Routes>
  );
}

export default AppRoutes;
