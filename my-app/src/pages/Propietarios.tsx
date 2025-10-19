import { useState } from "react";
// Usamos el alias para evitar colisión de nombres
import PropietarioModal from "../components/Modal"; 
import useLocalStorage from "../hooks/useLocalStorage"; 

// Tipos, interfaces y datos simulados
interface Department {
  number: string;
}

interface Building {
  id: number;
  nombre: string;
  departments: Department[]; // Estructura completa de la data de edificios
}

interface Propietario {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  mail: string;
  depto: string;
  saldo: number;
  building_id: number;
}

interface PropietarioForm {
  nombre: string;
  apellido: string;
  telefono: string;
  mail: string;
  depto: string;
  saldo?: number;
  building_id: number;
}

// Interfaz para la data de departamentos que necesita el Modal (formato de mapeo)
interface LocalDepartments {
    [key: number]: Department[];
}

function Propietarios() {
  // Persistencia de Propietarios
  const [propietarios, setPropietarios] = useLocalStorage<Propietario[]>(
    "propietariosData", 
    []
  ); 
  // Cargar la nueva data persistente de Edificios
  const [edificios] = useLocalStorage<Building[]>(
    "edificiosData", 
    []
  ); 
  
  const [showModal, setShowModal] = useState(false);
  const [editingPropietario, setEditingPropietario] = useState<Propietario | null>(null);

  // 1. Lista de edificios para el <select> del modal. Solo necesitamos ID y Nombre,
  // pero para evitar el error de tipado, mantenemos la estructura simple y la extraemos de edificios.
  const buildingsList = edificios.map(e => ({ id: e.id, nombre: e.nombre }));
    
  // 2. Mapeamos los departamentos al formato { [buildingId]: Department[] } que Modal.tsx espera.
  const localDepartments: LocalDepartments = edificios.reduce((acc, edificio) => {
    acc[edificio.id] = edificio.departments;
    return acc;
  }, {} as LocalDepartments);


  const handleSave = (nuevo: PropietarioForm) => {
    if (editingPropietario) {
      setPropietarios(
        propietarios.map((p) => (p.id === editingPropietario.id ? { ...p, ...nuevo as Propietario } : p))
      );
    } else {
      const newPropietario: Propietario = {
        id: Date.now(), 
        ...nuevo,
        saldo: 0, 
      };
      setPropietarios([...propietarios, newPropietario]);
    }
    
    setShowModal(false);
    setEditingPropietario(null);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este propietario?")) return;
    setPropietarios(propietarios.filter((p) => p.id !== id));
  };

  const handleEdit = (p: Propietario) => {
    setEditingPropietario(p);
    setShowModal(true);
  };

  const buildingFinder = (id: number) => edificios.find((b) => b.id === id)?.nombre || "Desconocido";

  return (
    <main className="main-container">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Teléfono</th>
              <th>Mail</th>
              <th>Nro Departamento</th>
              <th>Edificio</th>
              <th>Saldo</th>
              <th>Edición</th>
            </tr>
          </thead>
          <tbody>
            {propietarios.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.apellido}</td>
                <td>{p.telefono}</td>
                <td>{p.mail}</td>
                <td>{p.depto}</td>
                <td>{buildingFinder(p.building_id)}</td>
                <td>${p.saldo}</td>
                <td>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="edit-btn" onClick={() => handleEdit(p)}>
                      Editar
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="add-btn"
          onClick={() => {
            setEditingPropietario(null);
            setShowModal(true);
          }}
        >
          Añadir propietario
        </button>
      </div>

      {showModal && (
        <PropietarioModal 
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingPropietario(null); }}
          initialData={editingPropietario ?? undefined}
          isNew={!editingPropietario}
          buildings={buildingsList} // Usa la lista simple de edificios para el select
          localDepartments={localDepartments} 
        />
      )}
    </main>
  );
}

export default Propietarios;