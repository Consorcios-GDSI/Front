import { useState } from "react";

interface DepartamentoForm {
  apartment_name: string;
  unit_number: number;
  building_id: number;
}

interface ModalProps {
  onSave: (departamento: DepartamentoForm) => void;
  onClose: () => void;
  buildingId: number;
}

function ModalDepartamento({ onSave, onClose, buildingId }: ModalProps) {
  const [apartmentName, setApartmentName] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!apartmentName.trim()) newErrors.apartmentName = "El nombre del departamento es obligatorio";
    if (!unitNumber.trim()) newErrors.unitNumber = "El número de unidad es obligatorio";
    else if (isNaN(Number(unitNumber)) || Number(unitNumber) <= 0) {
      newErrors.unitNumber = "El número de unidad debe ser un número positivo";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const dataToSave: DepartamentoForm = {
      apartment_name: apartmentName,
      unit_number: Number(unitNumber),
      building_id: buildingId,
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
        <h2>Añadir Departamento</h2>
        
        <label>Nombre del Departamento</label>
        <input
          className={inputClass("apartmentName")}
          value={apartmentName}
          onChange={(e) => setApartmentName(e.target.value)}
          placeholder="Ej: Departamento A"
        />
        {errors.apartmentName && <small className="error-text">{errors.apartmentName}</small>}
        
        <label>Número de Unidad</label>
        <input
          className={inputClass("unitNumber")}
          value={unitNumber}
          onChange={(e) => setUnitNumber(e.target.value)}
          placeholder="Ej: 101"
          type="number"
        />
        {errors.unitNumber && <small className="error-text">{errors.unitNumber}</small>}
        
        <label>Edificio</label>
        <input
          value={buildingId}
          disabled
          style={{ background: "#eee", cursor: "not-allowed" }}
        />
        
        <button className="save-btn" onClick={handleSubmit}>
          Guardar
        </button>
      </div>
    </div>
  );
}

export default ModalDepartamento;
