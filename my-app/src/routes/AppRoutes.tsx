import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Propietarios from "../pages/Propietarios";
import Gastos from "../pages/Gastos";
import Expensas from "../pages/Expensas"; 
import Pagos from "../pages/Pagos";     
import Reportes from "../pages/Reportes"; 

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/propietarios" element={<Propietarios />} />
      <Route path="/gastos" element={<Gastos />} />
      <Route path="/expensas" element={<Expensas />} />    
      <Route path="/pagos" element={<Pagos />} />          
      <Route path="/reportes" element={<Reportes />} />    
    </Routes>
  );
}

export default AppRoutes;