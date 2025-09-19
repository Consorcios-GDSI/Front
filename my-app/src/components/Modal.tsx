import { useState, useEffect } from "react";

interface ModalProps {
  onSave: (data: any) => void;
  onClose: () => void;
  initialData?: any;
}

function Modal({ onSave, onClose, initialData }: ModalProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mail, setMail] = useState("");
  const [depto, setDepto] = useState("");
  const [saldo, setSaldo] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setApellido(initialData.apellido);
      setTelefono(initialData.telefono);
      setMail(initialData.mail);
      setDepto(initialData.depto);
      setSaldo(initialData.saldo);
    }
  }, [initialData]);

  const handleSave = () => {
    onSave({ nombre, apellido, telefono, mail, depto, saldo: Number(saldo) });
    // Limpiar campos
    setNombre(""); setApellido(""); setTelefono(""); setMail(""); setDepto(""); setSaldo("");
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2>{initialData ? "Editar Propietario" : "Añadir Propietario"}</h2>
        <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
        <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" />
        <input value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="Teléfono" />
        <input value={mail} onChange={e => setMail(e.target.value)} placeholder="Mail" />
        <input value={depto} onChange={e => setDepto(e.target.value)} placeholder="Nro Departamento" />
        <input value={saldo} onChange={e => setSaldo(e.target.value)} placeholder="Saldo" />
        <button className="save-btn" onClick={handleSave}>Guardar</button>
      </div>
    </div>
  );
}

export default Modal;
