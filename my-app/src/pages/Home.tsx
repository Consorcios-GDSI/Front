import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="main-container">
      <div className="options-container">
        <div className="option-card" onClick={() => navigate("/propietarios")}>
          Gestión Propietarios
        </div>
        <div className="option-card" onClick={() => navigate("/expensas")}>
          Expensas
        </div>
        <div className="option-card" onClick={() => navigate("/gastos")}>
          Gastos
        </div>
        <div className="option-card" onClick={() => navigate("/reportes")}>
          Reportes
        </div>
        <div className="option-card" onClick={() => navigate("/pagos")}>
          Pagos
        </div>
      </div>
    </main>
  );
}

export default Home;