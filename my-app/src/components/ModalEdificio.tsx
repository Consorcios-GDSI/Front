import { useState, useEffect } from "react";

interface Department {
  number: string;
}

interface EdificioForm {
  id: number;
  nombre: string;
  // departments se usa aquí para el formulario, pero se guarda como un objeto Department[]
  departments: Department[]; 
}

interface ModalProps {
  onSave: (edificio: EdificioForm) => void;
  onClose: () => void;
  initialData?: EdificioForm | null;
}

function ModalEdificio({ onSave, onClose, initialData }: ModalProps) {
  const [nombre, setNombre] = useState("");
  const [deptoString, setDeptoString] = useState(""); // Ej: "101, 102, 201"
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const isNew = !initialData;

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      // Convierte el array de objetos {number: 'xxx'} a un string separado por comas
      const deptos = initialData.departments.map(d => d.number).join(", ");
      setDeptoString(deptos);
    } else {
      setNombre("");
      setDeptoString("");
    }
    setErrors({});
  }, [initialData]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!nombre.trim()) newErrors.nombre = "Nombre es obligatorio";
    if (!deptoString.trim()) newErrors.depto = "La lista de departamentos es obligatoria";

    // Convertir el string a un array de Department[]
    const deptoArray: Department[] = deptoString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => ({ number: s }));
      
    if (deptoArray.length === 0 && deptoString.trim()) {
        newErrors.depto = "La lista de departamentos no es válida o está vacía";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const deptoArray: Department[] = deptoString
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => ({ number: s }));

    const dataToSave: EdificioForm = {
      id: initialData?.id || Date.now(),
      nombre,
      departments: deptoArray
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
        <h2>{isNew ? "Añadir Edificio" : "Editar Edificio"}</h2>

        <input
          className={inputClass("nombre")}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del Edificio (Ej: Torre A)"
        />
        {errors.nombre && <small className="error-text">{errors.nombre}</small>}

        <textarea
          className={inputClass("depto")}
          value={deptoString}
          onChange={(e) => setDeptoString(e.target.value)}
          placeholder="Departamentos (separados por coma, Ej: 101, 102, 2A)"
          rows={3}
        />
        {errors.depto && <small className="error-text">{errors.depto}</small>}

        <button className="save-btn" onClick={handleSubmit}>
          Guardar
        </button>
      </div>
    </div>
  );
}

export default ModalEdificio;