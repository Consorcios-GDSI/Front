import { useState } from "react";
import ModalGasto from "../components/ModalGasto";

interface Gasto {
  id: number;
  depto: string;
  tipo: string;
  monto: number;
  fecha: string;
  descripcion: string;
}

function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([
    { id: 1, depto: "101", tipo: "Luz", monto: 1500, fecha: "2025-09-19", descripcion: "Pago mensual luz" },
    { id: 2, depto: "102", tipo: "Agua", monto: 800, fecha: "2025-09-18", descripcion: "Pago agua" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [searchDepto, setSearchDepto] = useState("");

  const handleSave = (nuevo: Omit<Gasto, "id">) => {
    if (editingGasto) {
      setGastos(gastos.map(g => g.id === editingGasto.id ? { ...g, ...nuevo } : g));
      setEditingGasto(null);
    } else {
      setGastos([...gastos, { id: Date.now(), ...nuevo }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este gasto?")) {
      setGastos(gastos.filter(g => g.id !== id));
    }
  };

  const handleEdit = (g: Gasto) => {
    setEditingGasto(g);
    setShowModal(true);
  };

  const filteredGastos = gastos.filter(g => g.depto.includes(searchDepto));

  return (
    <main className="main-container">
      <div className="table-container">
        {/* Buscador centrado arriba de la tabla */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por departamento"
            value={searchDepto}
            onChange={e => setSearchDepto(e.target.value)}
          />
          <button onClick={() => {}}>Buscar</button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Nro Departamento</th>
              <th>Tipo</th>
              <th>Monto ($)</th>
              <th>Fecha de origen</th>
              <th>Descripción</th>
              <th>Edición</th>
            </tr>
          </thead>
          <tbody>
            {filteredGastos.map(g => (
              <tr key={g.id}>
                <td>{g.depto}</td>
                <td>{g.tipo}</td>
                <td>${g.monto}</td>
                <td>{g.fecha}</td>
                <td>{g.descripcion}</td>
                <td>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="edit-btn" onClick={() => handleEdit(g)}>Editar</button>
                    <button className="delete-btn" onClick={() => handleDelete(g.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Botón de añadir gasto debajo de la tabla */}
        <button className="add-btn" style={{ marginTop: "20px" }} onClick={() => setShowModal(true)}>
          Añadir gasto
        </button>
      </div>

      {showModal && (
        <ModalGasto
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingGasto(null); }}
          initialData={editingGasto || undefined}
        />
      )}
    </main>
  );
}

export default Gastos;
