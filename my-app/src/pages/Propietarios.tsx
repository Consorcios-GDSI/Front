import { useState, useEffect } from "react";
import Modal from "../components/Modal";

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

interface Building {
  id: number;
  nombre: string;
}

function Propietarios() {
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPropietario, setEditingPropietario] = useState<Propietario | null>(null);

  const fetchBuildings = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/buildings");
      setBuildings(await res.json());
    } catch (err) {
      console.error("Error al traer edificios:", err);
    }
  };

  const fetchPropietarios = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/residents");
      setPropietarios(await res.json());
    } catch (err) {
      console.error("Error al traer propietarios:", err);
    }
  };

  useEffect(() => {
    fetchBuildings();
    fetchPropietarios();
  }, []);

  const handleSave = async (nuevo: PropietarioForm) => {
    try {
      if (editingPropietario) {
        // actualizar local o PUT/PATCH a API
        setPropietarios(
          propietarios.map((p) => (p.id === editingPropietario.id ? { ...p, ...nuevo } : p))
        );
      } else {
        const res = await fetch(
          `http://127.0.0.1:8000/residents/${nuevo.building_id}/${nuevo.depto}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevo),
          }
        );
        const data: Propietario = await res.json();
        setPropietarios([...propietarios, data]);
      }
    } catch (err) {
      console.error("Error al guardar propietario:", err);
    } finally {
      setShowModal(false);
      setEditingPropietario(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este propietario?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/residents/${id}`, { method: "DELETE" });
      setPropietarios(propietarios.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error al eliminar propietario:", err);
    }
  };

  const handleEdit = (p: Propietario) => {
    setEditingPropietario(p);
    setShowModal(true);
  };

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
            {propietarios.map((p) => {
              const buildingName = buildings.find((b) => b.id === p.building_id)?.nombre || "Desconocido";
              return (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.apellido}</td>
                  <td>{p.telefono}</td>
                  <td>{p.mail}</td>
                  <td>{p.depto}</td>
                  <td>{buildingName}</td>
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
              );
            })}
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
        <Modal
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          initialData={editingPropietario ?? undefined}
          isNew={!editingPropietario}
          buildings={buildings}
        />
      )}
    </main>
  );
}

export default Propietarios;
