import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="main-container">
      <div className="options-container">
        <div className="option-card" onClick={() => navigate("/propietarios")}>
          Gestión Propietarios
        </div>
        <div className="option-card">Expensas</div>
        <div className="option-card">Gastos</div>
        <div className="option-card">Reportes</div>
        <div className="option-card">Pagos</div>
      </div>
    </main>
  );
}

export default Home;
