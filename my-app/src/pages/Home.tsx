import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <main className="main-container" style={{ flexDirection: "column" }}>
      <div style={{ width: "100%", textAlign: "center", marginBottom: "30px" }}>
        <h1 className="home-title">Sistema de Gestión de Consorcios</h1>
        <p className="home-subtitle">Seleccione una opción para comenzar</p>
      </div>
      <div className="options-container" style={{ width: "100%", textAlign: "center", marginBottom: "30px" }}>
        <div className="option-card" onClick={() => navigate("/edificios")}> {/* <-- Nueva tarjeta */}
          Gestión Edificios
        </div>
        <div className="option-card" onClick={() => navigate("/propietarios")}>
          Gestión Propietarios
        </div>
        <div className="option-card" onClick={() => navigate("/expensas")}>
          Expensas
        </div>
        <div className="option-card" onClick={() => navigate("/gastos")}>
          Gastos
        </div>
        <div className="option-card" onClick={() => navigate("/pagos")}>
          Pagos
        </div>
      </div>
    </main>
  );
}

export default Home;