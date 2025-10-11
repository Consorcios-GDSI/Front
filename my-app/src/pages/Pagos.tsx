import { useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

interface Pago {
  id: number;
  nroDepartamento: string;
  fecha: string;
  monto: number;
}

interface Propietario { // Para obtener la lista de departamentos disponibles
  depto: string;
}

const initialPagos: Pago[] = [
    { id: 1, nroDepartamento: "101", fecha: "2025-08-05", monto: 16650.00 },
    { id: 2, nroDepartamento: "102", fecha: "2025-08-04", monto: 12000.00 },
];

// Componente ModalPago (Definido internamente para no crear otro archivo)
const ModalPago = ({ onSave, onClose, initialData, availableDeptos }: any) => {
  const isNew = !initialData;
  const initialDepto = initialData?.nroDepartamento || availableDeptos[0] || "";

  const [depto, setDepto] = useState(initialDepto);
  const [fecha, setFecha] = useState(initialData?.fecha || "");
  const [monto, setMonto] = useState(initialData?.monto || 0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Asegurar que el depto inicial sea uno válido si cambia la lista
  useEffect(() => {
    if (!initialData) {
        setDepto(availableDeptos[0] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableDeptos]);


  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!depto.trim()) newErrors.depto = "Departamento es obligatorio";
    if (!fecha.trim()) newErrors.fecha = "Fecha es obligatoria";
    if (Number(monto) <= 0) newErrors.monto = "Monto debe ser positivo";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ nroDepartamento: depto, fecha, monto: Number(monto) });
  };
  
  const inputClass = (field: string) => (errors[field] ? "error-input" : "");

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>{isNew ? "Añadir Pago" : "Editar Pago"}</h2>
        
        <select className={inputClass("depto")} value={depto} onChange={(e) => setDepto(e.target.value)}>
            <option value="" disabled>Seleccione Departamento</option>
            {availableDeptos.map((d: string) => (
                <option key={d} value={d}>{d}</option>
            ))}
        </select>
        {errors.depto && <small className="error-text">{errors.depto}</small>}

        <input className={inputClass("fecha")} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        {errors.fecha && <small className="error-text">{errors.fecha}</small>}

        <input className={inputClass("monto")} type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" />
        {errors.monto && <small className="error-text">{errors.monto}</small>}

        <button className="save-btn" onClick={handleSubmit}>Guardar</button>
      </div>
    </div>
  );
};
// Fin ModalPago

function Pagos() {
  const [pagos, setPagos] = useLocalStorage<Pago[]>("pagosData", initialPagos);
  const [propietarios] = useLocalStorage<Propietario[]>("propietariosData", []); 
  
  const [searchDepto, setSearchDepto] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPago, setEditingPago] = useState<Pago | null>(null);

  const handleSave = (nuevo: Omit<Pago, "id">) => {
    if (editingPago) {
      setPagos(
        pagos.map((p) => (p.id === editingPago.id ? { ...p, ...nuevo } : p))
      );
    } else {
      setPagos([...pagos, { id: Date.now(), ...nuevo }]);
    }
    setShowModal(false);
    setEditingPago(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este pago?")) {
      setPagos(pagos.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (p: Pago) => {
    setEditingPago(p);
    setShowModal(true);
  };

  const filteredPagos = pagos.filter((p) =>
    p.nroDepartamento.includes(searchDepto)
  );
  
  const availableDeptos = Array.from(new Set(propietarios.map(p => p.depto)));

  return (
    <main className="main-container">
      <div className="table-container">
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
              <th>Fecha</th>
              <th>Monto</th>
              <th>Edición</th>
            </tr>
          </thead>
          <tbody>
            {filteredPagos.map((p) => (
              <tr key={p.id}>
                <td>{p.nroDepartamento}</td>
                <td>{p.fecha}</td>
                <td>${p.monto.toFixed(2)}</td>
                <td>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="edit-btn" onClick={() => handleEdit(p)}>
                      Editar
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="add-btn" style={{ marginTop: "20px" }} onClick={() => { setShowModal(true); setEditingPago(null); }}>
          Añadir Pago
        </button>
      </div>

      {showModal && (
        <ModalPago
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingPago(null); }}
          initialData={editingPago || undefined}
          availableDeptos={availableDeptos} 
        />
      )}
    </main>
  );
}

export default Pagos;