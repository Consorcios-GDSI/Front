import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

interface Expensa {
  id: number;
  nroDepartamento: string;
  nombre: string;
  apellido: string;
  expensaOrdinaria: number;
  expensaExtraordinaria: number;
  deuda: number;
  intereses: number;
  total: number;
}

const initialExpensas: Expensa[] = [
    {
      id: 1,
      nroDepartamento: "101",
      nombre: "Franco",
      apellido: "Gomez",
      expensaOrdinaria: 12000,
      expensaExtraordinaria: 3000,
      deuda: 1500,
      intereses: 150,
      total: 16650,
    },
    {
      id: 2,
      nroDepartamento: "102",
      nombre: "Silvana",
      apellido: "Diaz",
      expensaOrdinaria: 12000,
      expensaExtraordinaria: 0,
      deuda: 0,
      intereses: 0,
      total: 12000,
    },
];

function Expensas() {
  // Persistencia de la data y configuración
  const [expensas, setExpensas] = useLocalStorage<Expensa[]>(
    "expensasData", 
    initialExpensas
  ); 
  
  const [periodo, setPeriodo] = useLocalStorage("expensaPeriodo", "2025-08");
  const [vencimiento, setVencimiento] = useLocalStorage("expensaVencimiento", "2025-08-08");
  const [comisionAdmin, setComisionAdmin] = useLocalStorage("expensaComision", 10);
  
  const [searchDepto, setSearchDepto] = useState("");

  const filteredExpensas = expensas.filter((e) =>
    e.nroDepartamento.includes(searchDepto)
  );
  
  const handleGenerarReporte = () => {
      alert(`Generando Reporte de Expensas para el periodo ${periodo}. La data está persistida localmente.`);
  }
  
  const handleGestionarComision = () => {
       const nuevaComision = prompt("Ingrese el nuevo valor de la comisión del administrador:", String(comisionAdmin));
       const numComision = Number(nuevaComision);
       if (nuevaComision !== null && !isNaN(numComision) && numComision >= 0) {
           setComisionAdmin(numComision);
       } else if (nuevaComision !== null) {
           alert("Valor inválido.");
       }
  }

  return (
    <main className="main-container">
      <div className="table-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3>Periodo: 
              <input 
                type="month" 
                value={periodo} 
                onChange={(e) => setPeriodo(e.target.value)} 
                style={{ marginLeft: "10px" }}
              />
            </h3>
            <p style={{ marginTop: "5px" }}>Vencimiento: 
              <input 
                type="date" 
                value={vencimiento} 
                onChange={(e) => setVencimiento(e.target.value)} 
                style={{ marginLeft: "10px" }}
              />
            </p>
            <p style={{ marginTop: "5px" }}>Comisión del administrador: ${comisionAdmin}
              <button className="edit-btn" style={{ marginLeft: "10px" }} onClick={handleGestionarComision}>Gestionar</button>
            </p>
          </div>
          <button className="add-btn" onClick={handleGenerarReporte}>Generar Reporte</button>
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por Nro Departamento"
            value={searchDepto}
            onChange={(e) => setSearchDepto(e.target.value)}
          />
          <button onClick={() => {}}>Buscar</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nro Departamento</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Expensas Ordinarias</th>
              <th>Expensas Extraordinarias</th>
              <th>Deuda</th>
              <th>Intereses</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpensas.map((e) => (
              <tr key={e.id}>
                <td>{e.nroDepartamento}</td>
                <td>{e.nombre}</td>
                <td>{e.apellido}</td>
                <td>${e.expensaOrdinaria.toFixed(2)}</td>
                <td>${e.expensaExtraordinaria.toFixed(2)}</td>
                <td>${e.deuda.toFixed(2)}</td>
                <td>${e.intereses.toFixed(2)}</td>
                <td>${e.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Expensas;