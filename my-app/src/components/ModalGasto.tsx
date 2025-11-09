import { useState, useEffect } from "react";

interface GastoForm {
  depto: string;
  tipo: string;
  monto: number;
  fecha: string;
  descripcion: string;
}

interface DeptoOption {
  value: string;
  label: string;
}

interface ModalProps {
  onSave: (nuevo: GastoForm) => void;
  onClose: () => void;
  initialData?: GastoForm | null; 
  availableDeptos: DeptoOption[]; // Ahora acepta objetos con value y label
}

function ModalGasto({ onSave, onClose, initialData, availableDeptos }: ModalProps) {
  const isNew = !initialData;
  const initialDepto = initialData?.depto || availableDeptos[0]?.value || ""; // Usa el value del primer depto
    
  const [depto, setDepto] = useState(initialDepto);
  const [tipo, setTipo] = useState("");
  const [monto, setMonto] = useState<number>();
  const [fecha, setFecha] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setDepto(initialData.depto);
      setTipo(initialData.tipo);
      setMonto(initialData.monto);
      setFecha(initialData.fecha);
      setDescripcion(initialData.descripcion);
    } else {
      setDepto(availableDeptos[0]?.value || ""); // Usa el value del primer depto disponible
      setTipo("");
      setMonto(0);
      setFecha("");
      setDescripcion("");
    }
    setErrors({});
  }, [initialData, availableDeptos]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!depto.trim()) newErrors.depto = "Departamento es obligatorio";
    if (monto === null || monto === undefined || Number(monto) <= 0) newErrors.monto = "Monto debe ser un valor positivo";
    if (!fecha.trim()) newErrors.fecha = "Fecha es obligatoria";
    if (!descripcion.trim()) newErrors.descripcion = "Descripción es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()){
      return;
    }
    onSave({ depto, tipo, monto: Number(monto), fecha, descripcion }); 
  };

  const inputClass = (field: string) => (errors[field] ? "error-input" : "");

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2 style={{"textAlign": "center"}}>{isNew ? "Añadir Gasto" : "Editar Gasto"}</h2>

        {/* Campo de Departamento ahora es un SELECT */}
        <select className={inputClass("depto")} value={depto} onChange={(e) => setDepto(e.target.value)}>
            <option value="" disabled>Seleccione Departamento</option>
            {availableDeptos.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
            ))}
        </select>
        {errors.depto && <small className="error-text">{errors.depto}</small>}

        <input
          className={inputClass("monto")}
          value={monto}
          type="number"
          onChange={(e) => setMonto(Number(e.target.value))}
          placeholder="Monto"
        />
        {errors.monto && <small className="error-text">{errors.monto}</small>}

        <input
          className={inputClass("fecha")}
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        {errors.fecha && <small className="error-text">{errors.fecha}</small>}

        <input
          className={inputClass("descripcion")}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción"
        />
        {errors.descripcion && <small className="error-text">{errors.descripcion}</small>}

        <button className="save-btn" onClick={handleSubmit}>
          Guardar
        </button>
      </div>
    </div>
  );
}

export default ModalGasto;