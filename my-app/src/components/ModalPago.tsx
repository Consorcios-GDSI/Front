import { useState, useEffect } from "react";

interface PagoForm {
  depto: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  descripcion: string;
  numero_referencia: string;
}

interface DeptoOption {
  value: string;
  label: string;
}

interface ModalProps {
  onSave: (nuevo: PagoForm) => void;
  onClose: () => void;
  initialData?: PagoForm | null;
  availableDeptos: DeptoOption[];
}

function ModalPago({ onSave, onClose, initialData, availableDeptos }: ModalProps) {
  const isNew = !initialData;
  const initialDepto = initialData?.depto || availableDeptos[0]?.value || "";

  const [depto, setDepto] = useState(initialDepto);
  const [monto, setMonto] = useState<number>();
  const [fecha, setFecha] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [numeroReferencia, setNumeroReferencia] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setDepto(initialData.depto);
      setMonto(initialData.monto);
      setFecha(initialData.fecha);
      setMetodoPago(initialData.metodo_pago);
      setDescripcion(initialData.descripcion);
      setNumeroReferencia(initialData.numero_referencia);
    } else {
      setDepto(availableDeptos[0]?.value || "");
      setMonto(0);
      setFecha("");
      setMetodoPago("");
      setDescripcion("");
      setNumeroReferencia("");
    }
    setErrors({});
  }, [initialData, availableDeptos]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!depto.trim()) newErrors.depto = "Departamento es obligatorio";
    if (monto === null || monto === undefined || Number(monto) <= 0)
      newErrors.monto = "Monto debe ser un valor positivo";
    if (!fecha.trim()) newErrors.fecha = "Fecha es obligatoria";
    if (!metodoPago.trim()) newErrors.metodoPago = "Método de pago es obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      console.log("Validation failed", errors);
      return;
    }
    onSave({
      depto,
      monto: Number(monto),
      fecha,
      metodo_pago: metodoPago,
      descripcion,
      numero_referencia: numeroReferencia,
    });
  };

  const inputClass = (field: string) => (errors[field] ? "error-input" : "");

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>{isNew ? "Añadir Pago" : "Editar Pago"}</h2>

        {/* Campo de Departamento */}
        <select
          className={inputClass("depto")}
          value={depto}
          onChange={(e) => setDepto(e.target.value)}
        >
          <option value="" disabled>
            Seleccione Departamento
          </option>
          {availableDeptos.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        {errors.depto && <small className="error-text">{errors.depto}</small>}

        {/* Monto */}
        <input
          className={inputClass("monto")}
          type="number"
          value={monto}
          onChange={(e) => setMonto(Number(e.target.value))}
          placeholder="Monto"
        />
        {errors.monto && <small className="error-text">{errors.monto}</small>}

        {/* Fecha */}
        <input
          className={inputClass("fecha")}
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        {errors.fecha && <small className="error-text">{errors.fecha}</small>}

        {/* Método de Pago */}
        <select
          className={inputClass("metodoPago")}
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="" disabled>
            Seleccionar Método de Pago
          </option>
          <option value="cash">Efectivo</option>
          <option value="transfer">Transferencia</option>
          <option value="credit_card">Tarjeta de Crédito</option>
          <option value="debit_card">Tarjeta de Débito</option>
        </select>
        {errors.metodoPago && <small className="error-text">{errors.metodoPago}</small>}

        {/* Descripción (Opcional) */}
        <input
          className={inputClass("descripcion")}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción (opcional)"
        />

        {/* Número de Referencia (Opcional) */}
        <input
          className={inputClass("numeroReferencia")}
          value={numeroReferencia}
          onChange={(e) => setNumeroReferencia(e.target.value)}
          placeholder="Número de referencia (opcional)"
        />

        <button className="save-btn" onClick={handleSubmit}>
          Guardar
        </button>
      </div>
    </div>
  );
}

export default ModalPago;
