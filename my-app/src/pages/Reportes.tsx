import { useNavigate } from "react-router-dom";

function Reportes() {
  const navigate = useNavigate();

  const reportes = [
    { nombre: "Reporte de Deudas", path: "/reportes/deudas" },
    { nombre: "Reporte Histórico de Gastos", path: "/reportes/gastos-historico" },
    { nombre: "Reporte de Ingresos por Pagos", path: "/reportes/pagos-ingresos" },
  ];

  const handleGenerar = (nombre: string) => {
      alert(`Generando ${nombre} con la data actual almacenada en localStorage.`);
  }

  return (
    <main className="main-container">
      <div className="table-container" style={{ maxWidth: "600px" }}>
        <h2>Generación de Reportes</h2>
        <p style={{marginBottom: "20px", color: "#007bff"}}>
            Nota: Todos los reportes se generan con la data persistida localmente en el navegador.
        </p>
        <div 
          className="options-container" 
          style={{ gridTemplateColumns: "1fr", gap: "15px", marginTop: "20px" }}
        >
          {reportes.map((reporte) => (
            <div 
              key={reporte.nombre} 
              className="option-card" 
              style={{ width: "100%", height: "auto", padding: "20px", cursor: "default", flexDirection: "column" }}
            >
              <p style={{ fontWeight: "bold" }}>{reporte.nombre}</p>
              <button 
                className="add-btn" 
                style={{ marginTop: "10px" }} 
                onClick={() => handleGenerar(reporte.nombre)}
              >
                Generar
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Reportes;