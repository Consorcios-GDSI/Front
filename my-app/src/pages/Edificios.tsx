import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import ModalEdificio from "../components/ModalEdificio";

interface Department {
  number: string;
}

interface Edificio {
  id: number;
  nombre: string;
  departments: Department[];
}

function Edificios() {
  const [edificios, setEdificios] = useLocalStorage<Edificio[]>(
    "edificiosData", 
    []
  ); 
  
  const [showModal, setShowModal] = useState(false);
  const [editingEdificio, setEditingEdificio] = useState<Edificio | null>(null);

  const handleSave = (nuevo: Edificio) => {
    if (editingEdificio) {
      // Editar
      setEdificios(
        edificios.map((e) => (e.id === editingEdificio.id ? { ...e, ...nuevo } : e))
      );
    } else {
      // Añadir (el ID ya se generó en el Modal)
      setEdificios([...edificios, nuevo]);
    }
    
    setShowModal(false);
    setEditingEdificio(null);
  };

  const handleDelete = (id: number, nombre: string) => {
    if (!window.confirm(`¿Está seguro que desea eliminar el edificio ${nombre}?`)) return;
    
    // NOTA: En un sistema real, aquí habría que verificar si hay propietarios en este edificio.
    setEdificios(edificios.filter((e) => e.id !== id));
  };

  const handleEdit = (e: Edificio) => {
    setEditingEdificio(e);
    setShowModal(true);
  };

  return (
    <main className="main-container">
      <div className="table-container">
        <h2>Gestión de Edificios y Departamentos</h2>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Total Deptos.</th>
              <th>Lista de Departamentos</th>
              <th>Edición</th>
            </tr>
          </thead>
          <tbody>
            {edificios.map((e) => (
              <tr key={e.id}>
                <td>{e.nombre}</td>
                <td>{e.departments.length}</td>
                <td style={{ fontSize: "0.9em", maxWidth: "400px", wordBreak: "break-word" }}>
                    {e.departments.map(d => d.number).join(", ")}
                </td>
                <td>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="edit-btn" onClick={() => handleEdit(e)}>
                      Editar
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(e.id, e.nombre)}>
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
            setEditingEdificio(null);
            setShowModal(true);
          }}
        >
          Añadir Edificio
        </button>
      </div>

      {showModal && (
        <ModalEdificio
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingEdificio(null); }}
          initialData={editingEdificio ?? null}
        />
      )}
    </main>
  );
}

export default Edificios;