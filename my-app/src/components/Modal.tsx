import { useState } from "react";

// Definimos el tipo de props
interface ModalProps {
  onSave: (nuevo: {
    nombre: string;
    apellido: string;
    telefono: string;
    mail: string;
    depto: string;
    saldo: string;
  }) => void;
  onClose: () => void;
}

function Modal({ onSave, onClose }: ModalProps) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    mail: "",
    depto: "",
    saldo: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (Object.values(form).some((v) => !v)) {
      alert("Por favor completa todos los campos.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>Añadir Propietario</h2>
        <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
        <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} />
        <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
        <input name="mail" placeholder="Mail" value={form.mail} onChange={handleChange} />
        <input name="depto" placeholder="Nro Departamento" value={form.depto} onChange={handleChange} />
        <input name="saldo" placeholder="Saldo" value={form.saldo} onChange={handleChange} />
        <button className="save-btn" onClick={handleSave}>Guardar</button>
      </div>
    </div>
  );
}

export default Modal;
