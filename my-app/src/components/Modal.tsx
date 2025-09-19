import { useState, useEffect } from "react";

interface PropietarioForm {
  nombre: string;
  apellido: string;
  telefono: string;
  mail: string;
  depto: string;
  saldo?: number;
}

interface ModalProps {
  onSave: (nuevo: PropietarioForm) => void;
  onClose: () => void;
  initialData?: PropietarioForm;
  isNew?: boolean;
}

function Modal({ onSave, onClose, initialData, isNew = true }: ModalProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mail, setMail] = useState("");
  const [depto, setDepto] = useState("");
  const [saldo, setSaldo] = useState<number>(0);

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setApellido(initialData.apellido);
      setTelefono(initialData.telefono);
      setMail(initialData.mail);
      setDepto(initialData.depto);
      setSaldo(initialData.saldo ?? 0);
    } else {
      setNombre("");
      setApellido("");
      setTelefono("");
      setMail("");
      setDepto("");
      setSaldo(0);
    }
    setErrors({});
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    if (!nombre.trim()) newErrors.nombre = "Nombre es obligatorio";
    if (!apellido.trim()) newErrors.apellido = "Apellido es obligatorio";
    if (!telefono.trim()) newErrors.telefono = "Teléfono es obligatorio";
    if (!mail.trim()) newErrors.mail = "Mail es obligatorio";
    if (!depto.trim()) newErrors.depto = "Departamento es obligatorio";
    if (!isNew && (saldo === null || saldo === undefined)) newErrors.saldo = "Saldo es obligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return; // no guarda si hay errores

    const nuevo: PropietarioForm = { nombre, apellido, telefono, mail, depto };
    if (!isNew) {
      nuevo.saldo = saldo;
    }
    onSave(nuevo);
  };

  const inputClass = (field: string) => errors[field] ? "error-input" : "";

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>{isNew ? "Añadir Propietario" : "Editar Propietario"}</h2>

        <input className={inputClass("nombre")} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
        {errors.nombre && <small className="error-text">{errors.nombre}</small>}

        <input className={inputClass("apellido")} value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" />
        {errors.apellido && <small className="error-text">{errors.apellido}</small>}

        <input className={inputClass("telefono")} value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono" />
        {errors.telefono && <small className="error-text">{errors.telefono}</small>}

        <input className={inputClass("mail")} value={mail} onChange={e => setMail(e.target.value)} placeholder="Mail" />
        {errors.mail && <small className="error-text">{errors.mail}</small>}

        <input className={inputClass("depto")} value={depto} onChange={e => setDepto(e.target.value)} placeholder="Departamento" />
        {errors.depto && <small className="error-text">{errors.depto}</small>}

        {!isNew && (
          <>
            <input className={inputClass("saldo")} type="number" value={saldo} onChange={e => setSaldo(Number(e.target.value))} placeholder="Saldo" />
            {errors.saldo && <small className="error-text">{errors.saldo}</small>}
          </>
        )}

        <button className="save-btn" onClick={handleSubmit}>Guardar</button>
      </div>
    </div>
  );
}

export default Modal;
