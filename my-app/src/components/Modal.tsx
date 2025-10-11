import { useState, useEffect } from "react";

interface PropietarioForm {
  nombre: string;
  apellido: string;
  telefono: string;
  mail: string;
  depto: string;
  saldo?: number;
  building_id: number;
}

interface Building {
  id: number;
  nombre: string;
}

interface Department {
  number: string;
}

interface LocalDepartments {
    [key: number]: Department[];
}

interface ModalProps {
  onSave: (nuevo: PropietarioForm) => void;
  onClose: () => void;
  initialData?: PropietarioForm;
  isNew?: boolean;
  buildings: Building[];
  localDepartments: LocalDepartments;
}

function Modal({ onSave, onClose, initialData, isNew = true, buildings, localDepartments }: ModalProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [mail, setMail] = useState("");
  const [depto, setDepto] = useState("");
  const [saldo, setSaldo] = useState<number>(0);
  const [buildingId, setBuildingId] = useState<number>(buildings[0]?.id || 0);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setApellido(initialData.apellido);
      setTelefono(initialData.telefono);
      setMail(initialData.mail);
      setDepto(initialData.depto);
      setSaldo(initialData.saldo ?? 0);
      setBuildingId(initialData.building_id);
    } else {
      setNombre("");
      setApellido("");
      setTelefono("");
      setMail("");
      setDepto("");
      setSaldo(0);
      setBuildingId(buildings[0]?.id || 0);
    }
    setErrors({});
  }, [initialData, buildings]);

  // Carga de departamentos según el edificio seleccionado (data fija local)
  useEffect(() => {
    const newDepartments = localDepartments[buildingId] || [];
    setDepartments(newDepartments);
    
    // Si el departamento actual no existe en la nueva lista, seleccionamos el primero (o lo dejamos vacío si no hay)
    if (!newDepartments.some((d) => d.number === depto) || !depto) {
        setDepto(newDepartments[0]?.number || "");
    }
    
  }, [buildingId, localDepartments, depto]); 

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!nombre.trim()) newErrors.nombre = "Nombre es obligatorio";
    if (!apellido.trim()) newErrors.apellido = "Apellido es obligatorio";
    if (!telefono.trim()) newErrors.telefono = "Teléfono es obligatorio";
    if (!mail.trim()) newErrors.mail = "Mail es obligatorio";
    if (!depto.trim()) newErrors.depto = "Departamento es obligatorio";
    if (!buildingId) newErrors.building_id = "Edificio es obligatorio";
    if (!isNew && (saldo === null || saldo === undefined)) newErrors.saldo = "Saldo es obligatorio"; 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const nuevo: PropietarioForm = { nombre, apellido, telefono, mail, depto, building_id: buildingId };
    if (!isNew) nuevo.saldo = saldo;
    onSave(nuevo);
  };

  const inputClass = (field: string) => (errors[field] ? "error-input" : "");

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2>{isNew ? "Añadir Propietario" : "Editar Propietario"}</h2>

        <input className={inputClass("nombre")} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
        {errors.nombre && <small className="error-text">{errors.nombre}</small>}

        <input className={inputClass("apellido")} value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" />
        {errors.apellido && <small className="error-text">{errors.apellido}</small>}

        <input className={inputClass("telefono")} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Teléfono" />
        {errors.telefono && <small className="error-text">{errors.telefono}</small>}

        <input className={inputClass("mail")} value={mail} onChange={(e) => setMail(e.target.value)} placeholder="Mail" />
        {errors.mail && <small className="error-text">{errors.mail}</small>}

        <select className={inputClass("building_id")} value={buildingId} onChange={(e) => setBuildingId(Number(e.target.value))}>
          <option value={0} disabled>Seleccione Edificio</option>
          {buildings.map((b: Building) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
        {errors.building_id && <small className="error-text">{errors.building_id}</small>}
        
        {departments.length > 0 && (
            <select className={inputClass("depto")} value={depto} onChange={(e) => setDepto(e.target.value)}>
              <option value="" disabled>Seleccione Departamento</option>
              {departments.map((d: Department) => (
                <option key={d.number} value={d.number}>
                  {d.number}
                </option>
              ))}
            </select>
        )}
        {departments.length === 0 && <input placeholder="No hay departamentos para este edificio" disabled />}
        {errors.depto && <small className="error-text">{errors.depto}</small>}

        {!isNew && (
          <>
            <input
              className={inputClass("saldo")}
              type="number"
              value={saldo}
              onChange={(e) => setSaldo(Number(e.target.value))}
              placeholder="Saldo"
            />
            {errors.saldo && <small className="error-text">{errors.saldo}</small>}
          </>
        )}

        <button className="save-btn" onClick={handleSubmit}>
          Guardar
        </button>
      </div>
    </div>
  );
}

export default Modal;