import { useState, useEffect } from "react";

interface EdificioForm {
  id: number;
  address: string;
}

interface ModalProps {
  onSave: (edificio: EdificioForm) => void;
  onClose: () => void;
  initialData?: EdificioForm | null;
}

function ModalEdificio({ onSave, onClose, initialData }: ModalProps) {
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const isNew = !initialData;

  useEffect(() => {
    if (initialData) {
      setAddress(initialData.address);
    } else {
      setAddress("");
    }
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!address.trim()) newErrors.address = "La dirección es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const dataToSave: EdificioForm = {
      id: initialData?.id || Date.now(),
      address,
    };
    onSave(dataToSave);
  };

  const inputClass = (field: string) => (errors[field] ? "error-input" : "");

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2 style={{textAlign: "center"}}>{isNew ? "Añadir Edificio" : "Editar Dirección"}</h2>
        <input
          className={inputClass("address")}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Dirección del Edificio"
        />
        {errors.address && <small className="error-text">{errors.address}</small>}
        <button className="save-btn" onClick={handleSubmit}>
          Guardar
        </button>
      </div>
    </div>
  );
}

export default ModalEdificio;