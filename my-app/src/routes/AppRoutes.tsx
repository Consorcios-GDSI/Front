import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Propietarios from "../pages/Propietarios";
import Gastos from "../pages/Gastos";
import Expensas from "../pages/Expensas"; 
import Pagos from "../pages/Pagos";     
import Edificios from "../pages/Edificios"; // <-- Nuevo import
import Departamentos from "../pages/Departamentos";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/propietarios" element={<Propietarios />} />
      <Route path="/gastos" element={<Gastos />} />
      <Route path="/expensas" element={<Expensas />} />    
      <Route path="/pagos" element={<Pagos />} />          
      {/* <Route path="/reportes" element={<Reportes />} />     */}
      <Route path="/edificios" element={<Edificios />} /> {/* <-- Nueva ruta */}
      <Route path="/departamentos/:id" element={<Departamentos />} />
    </Routes>
  );
}

export default AppRoutes;