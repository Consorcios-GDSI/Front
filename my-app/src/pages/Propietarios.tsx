import { useState } from "react";
// 💡 SOLUCIÓN: Usar un alias para el componente Modal importado
import PropietarioModal from "../components/Modal"; 
import useLocalStorage from "../hooks/useLocalStorage"; 

// Tipos, interfaces y datos simulados
interface Building {
  id: number;
  nombre: string;
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

// Data fija de edificios y departamentos (CANTIDAD DE NÚMEROS SETEADA)
const initialBuildings: Building[] = [
    { id: 1, nombre: "Edificio A" },
    { id: 2, nombre: "Edificio B" },
];

const initialDepartments = {
    1: [{ number: "101" }, { number: "102" }, { number: "201" }],
    2: [{ number: "1A" }, { number: "2B" }],
};


function Propietarios() {
  // Persistencia de Propietarios
  const [propietarios, setPropietarios] = useLocalStorage<Propietario[]>(
    "propietariosData", 
    []
  ); 
  
  const [buildings] = useState<Building[]>(initialBuildings); 
  const [showModal, setShowModal] = useState(false);
  const [editingPropietario, setEditingPropietario] = useState<Propietario | null>(null);

  const handleSave = (nuevo: PropietarioForm) => {
    if (editingPropietario) {
      // Editar
      setPropietarios(
        propietarios.map((p) => (p.id === editingPropietario.id ? { ...p, ...nuevo as Propietario } : p))
      );
    } else {
      // Añadir
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

  const buildingFinder = (id: number) => buildings.find((b) => b.id === id)?.nombre || "Desconocido";

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
        <PropietarioModal // 💡 USAR EL ALIAS DE IMPORTACIÓN
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingPropietario(null); }}
          initialData={editingPropietario ?? undefined}
          isNew={!editingPropietario}
          buildings={buildings}
          localDepartments={initialDepartments} 
        />
      )}
    </main>
  );
}

export default Propietarios;