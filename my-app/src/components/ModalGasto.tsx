import { useState, useEffect } from "react";

interface GastoForm {
  depto: string;
  tipo: string;
  monto: number;
  fecha: string;
  descripcion: string;
}

interface ModalProps {
  onSave: (nuevo: GastoForm) => void;
  onClose: () => void;
  initialData?: GastoForm | null; // <--- aceptar null
}

function ModalGasto({ onSave, onClose, initialData }: ModalProps) {
  const [depto, setDepto] = useState("");
  const [tipo, setTipo] = useState("");
  const [monto, setMonto] = useState<number>(0);
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
      setDepto("");
      setTipo("");
      setMonto(0);
      setFecha("");
      setDescripcion("");
    }
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!depto.trim()) newErrors.depto = "Departamento es obligatorio";
    if (!tipo.trim()) newErrors.tipo = "Tipo es obligatorio";
    if (!monto) newErrors.monto = "Monto es obligatorio";
    if (!fecha.trim()) newErrors.fecha = "Fecha es obligatoria";
    if (!descripcion.trim()) newErrors.descripcion = "Descripción es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ depto, tipo, monto, fecha, descripcion });
  };

  const inputClass = (field: string) => (errors[field] ? "error-input" : "");

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>{initialData ? "Editar gasto" : "Añadir gasto"}</h2>

        <input
          className={inputClass("depto")}
          value={depto}
          onChange={(e) => setDepto(e.target.value)}
          placeholder="Departamento"
        />
        {errors.depto && <small className="error-text">{errors.depto}</small>}

        <input
          className={inputClass("tipo")}
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          placeholder="Tipo"
        />
        {errors.tipo && <small className="error-text">{errors.tipo}</small>}

        <input
          className={inputClass("monto")}
          type="number"
          value={monto}
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
