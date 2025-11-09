import { useState, useEffect } from "react";

// Nueva forma: se elimina 'apellido' y se agrega 'dni'
interface PropietarioForm {
  nombre: string;      // Nombre completo
  dni: number;         // DNI del propietario
  telefono: string;    // Teléfono (string para input controlado)
  mail: string;        // Correo
  depto: string;       // Número de unidad (unit_number)
  building_id: number; // Id del edificio
  old_depto?: string;  // Departamento actual (para edición)
  old_building_id?: number; // Edificio actual (para edición)
}

interface Building {
  id: number;
  nombre: string;
}

interface Department {
  number: string;
  name: string;
}

interface CurrentApartment {
  building_id: number;
  unit_number: number;
  building_name?: string;
  apartment_name?: string;
}

// Eliminamos dependencia de departamentos locales: se consultarán vía API

interface ModalProps {
  onSave: (nuevo: PropietarioForm) => void;
  onClose: () => void;
  initialData?: PropietarioForm;
  isNew?: boolean;
  buildings: Building[];
  currentApartments?: CurrentApartment[]; // Departamentos actuales del residente (solo para edición)
  isAddingApartment?: boolean; // Indica si se está agregando un departamento a un propietario existente
}

const API_BASE_URL = "http://127.0.0.1:8000";

function Modal({ onSave, onClose, initialData, isNew = true, buildings, currentApartments = [], isAddingApartment = false }: ModalProps) {
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState<string>("");
  const [telefono, setTelefono] = useState("");
  const [mail, setMail] = useState("");
  const [depto, setDepto] = useState("");
  const [buildingId, setBuildingId] = useState<number>(buildings[0]?.id || 0);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Para edición: departamento actual seleccionado
  const [oldDepto, setOldDepto] = useState<string>("");
  const [oldBuildingId, setOldBuildingId] = useState<number>(0);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre);
      setDni(String(initialData.dni));
      setTelefono(initialData.telefono);
      setMail(initialData.mail);
      // En modo edición, iniciar sin departamento nuevo seleccionado (para no modificar por defecto)
      setDepto("");
      setBuildingId(0);
      // Inicializar con el primer departamento actual si existe
      if (currentApartments.length > 0) {
        setOldBuildingId(currentApartments[0].building_id);
        setOldDepto(String(currentApartments[0].unit_number));
      }
    } else {
      setNombre("");
      setDni("");
      setTelefono("");
      setMail("");
      setDepto("");
      setBuildingId(buildings[0]?.id || 0);
      setOldBuildingId(0);
      setOldDepto("");
    }
    setErrors({});
  }, [initialData, buildings, currentApartments]);

  // Carga de departamentos dinámicos vía backend al cambiar el edificio
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!buildingId) { setDepartments([]); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/apartments/${buildingId}`);
        const data = await res.json();
        // Mapear con número y nombre del departamento
        const mapped: Department[] = Array.isArray(data)
          ? data.map((a: any) => ({ 
              number: String(a.unit_number ?? a.number ?? ""),
              name: a.apartment_name || `Depto ${a.unit_number}` 
            }))
          : [];
        setDepartments(mapped.filter(d => d.number));
        if (!mapped.some((d) => d.number === depto)) {
          setDepto(mapped[0]?.number || "");
        }
      } catch (e) {
        console.error("Error cargando departamentos", e);
        setDepartments([]);
        setDepto("");
      }
    };
    fetchDepartments();
  }, [buildingId]);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Si es agregar departamento, solo validar edificio y departamento
    if (isAddingApartment) {
      if (!buildingId) newErrors.building_id = "Edificio es obligatorio";
      if (!depto.trim()) newErrors.depto = "Departamento es obligatorio";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    
    // Validaciones normales
    if (!dni.trim()) newErrors.dni = "DNI es obligatorio";
    if (!nombre.trim()) newErrors.nombre = "Nombre es obligatorio";
    if (!telefono.trim()) {
      newErrors.telefono = "Teléfono es obligatorio";
    } else {
      const tel = telefono.trim();
      if (!/^\d+$/.test(tel)) {
      newErrors.telefono = "Teléfono debe contener solo números";
      }
    }
    if (!mail.trim()) newErrors.mail = "Mail es obligatorio";
    // En modo nuevo, departamento y edificio son obligatorios
    if (isNew && !depto.trim()) newErrors.depto = "Departamento es obligatorio";
    if (isNew && !buildingId) newErrors.building_id = "Edificio es obligatorio";
    // En modo edición, si se selecciona edificio debe haber departamento y viceversa
    if (!isNew && buildingId && !depto.trim()) newErrors.depto = "Si selecciona edificio, debe seleccionar departamento";
    if (!isNew && depto.trim() && !buildingId) newErrors.building_id = "Si selecciona departamento, debe seleccionar edificio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const nuevo: PropietarioForm = {
      nombre,
      dni: parseInt(dni, 10),
      telefono,
      mail,
      depto,
      building_id: buildingId,
    };
    // Si es edición, incluir los campos old_
    if (!isNew) {
      nuevo.old_depto = oldDepto;
      nuevo.old_building_id = oldBuildingId;
    }
    onSave(nuevo);
  };

  const inputClass = (field: string) => (errors[field] ? "error-input" : "");

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close-btn" onClick={onClose}>
          &times;
        </span>
        <h2 style={{"textAlign": "center"}}>{isAddingApartment ? "Agregar Departamento" : isNew ? "Añadir Propietario" : "Editar Propietario"}</h2>

  <input 
    className={inputClass("dni")} 
    value={dni} 
    onChange={(e) => setDni(e.target.value)} 
    placeholder="DNI" 
    disabled={!isNew || isAddingApartment}
    style={isAddingApartment ? { backgroundColor: '#f5f5f5' } : {}}
  />
  {errors.dni && <small className="error-text">{errors.dni}</small>}

  <input 
    className={inputClass("nombre")} 
    value={nombre} 
    onChange={(e) => setNombre(e.target.value)} 
    placeholder="Nombre completo" 
    disabled={isAddingApartment}
    style={isAddingApartment ? { backgroundColor: '#f5f5f5' } : {}}
  />
  {errors.nombre && <small className="error-text">{errors.nombre}</small>}

        <input 
          className={inputClass("telefono")} 
          value={telefono} 
          onChange={(e) => setTelefono(e.target.value)} 
          placeholder="Teléfono" 
          disabled={isAddingApartment}
          style={isAddingApartment ? { backgroundColor: '#f5f5f5' } : {}}
        />
        {errors.telefono && <small className="error-text">{errors.telefono}</small>}

        <input 
          className={inputClass("mail")} 
          value={mail} 
          onChange={(e) => setMail(e.target.value)} 
          placeholder="Mail" 
          disabled={isAddingApartment}
          style={isAddingApartment ? { backgroundColor: '#f5f5f5' } : {}}
        />
        {errors.mail && <small className="error-text">{errors.mail}</small>}

        {(isNew || isAddingApartment) && (
          <>
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
                      {d.number} - {d.name}
                    </option>
                  ))}
                </select>
            )}
            {departments.length === 0 && <input placeholder="No hay departamentos para este edificio" disabled />}
            {errors.depto && <small className="error-text">{errors.depto}</small>}
          </>
        )}

        {!isNew && (
          <>
            {/* Selección del departamento actual (old_) */}
            <label style={{ fontSize: '14px', color: '#333', fontWeight: 'bold', marginTop: '15px' }}>
              Departamento Actual
            </label>
            {currentApartments.length > 0 ? (
              <select 
                style={{ backgroundColor: '#f5f5f5' }}
                value={`${oldBuildingId}-${oldDepto}`} 
                onChange={(e) => {
                  const [buildingId, unitNumber] = e.target.value.split('-');
                  setOldBuildingId(Number(buildingId));
                  setOldDepto(unitNumber);
                }}
              >
                {currentApartments.map((apt) => {
                  const buildingName = buildings.find(b => b.id === apt.building_id)?.nombre || `Edificio ${apt.building_id}`;
                  const apartmentName = apt.apartment_name || `Depto ${apt.unit_number}`;
                  return (
                    <option key={`${apt.building_id}-${apt.unit_number}`} value={`${apt.building_id}-${apt.unit_number}`}>
                      {buildingName} - {apt.unit_number} - {apartmentName}
                    </option>
                  );
                })}
              </select>
            ) : (
              <input placeholder="Sin departamentos asignados" disabled style={{ backgroundColor: '#f5f5f5' }} />
            )}

            {/* Sección de nuevo departamento (opcional) */}
            <label style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>
              Cambiar a Nuevo Departamento (opcional)
            </label>
            <select className={inputClass("building_id")} value={buildingId} onChange={(e) => setBuildingId(Number(e.target.value))}>
              <option value={0}>Seleccione Edificio (opcional)</option>
              {buildings.map((b: Building) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>
            {errors.building_id && <small className="error-text">{errors.building_id}</small>}
            
            {buildingId !== 0 && departments.length > 0 && (
                <select className={inputClass("depto")} value={depto} onChange={(e) => setDepto(e.target.value)}>
                  <option value="">Seleccione Departamento</option>
                  {departments.map((d: Department) => (
                    <option key={d.number} value={d.number}>
                      {d.number} - {d.name}
                    </option>
                  ))}
                </select>
            )}
            {buildingId !== 0 && departments.length === 0 && <input placeholder="No hay departamentos para este edificio" disabled />}
            {errors.depto && <small className="error-text">{errors.depto}</small>}
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