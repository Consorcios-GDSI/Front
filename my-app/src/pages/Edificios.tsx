import { useState, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import ModalEdificio from "../components/ModalEdificio";
import { useNavigate } from "react-router-dom";

interface Edificio {
  id: number;
  address: string;
}

function Edificios() {
  const [edificios, setEdificios] = useLocalStorage<Edificio[]>(
    "edificiosData",
    []
  );

  const [showModal, setShowModal] = useState(false);
  const [editingEdificio, setEditingEdificio] = useState<Edificio | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://127.0.0.1:8000/buildings")
      .then((res) => res.json())
      .then((data) => {
        setEdificios(data);
      })
      .catch((err) => {
        console.error("Error al cargar edificios:", err);
      });
  }, []);

  const handleSave = async (nuevo: Edificio) => {
    if (editingEdificio) {
      // Editar dirección en el backend
      try {
        const response = await fetch(`http://127.0.0.1:8000/buildings/${editingEdificio.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: nuevo.address }),
        });
        if (!response.ok) throw new Error("Error actualizando dirección");
        // Actualizar en frontend
        setEdificios(
          edificios.map((e) => (e.id === editingEdificio.id ? { ...e, address: nuevo.address } : e))
        );
      } catch (err) {
        console.error(err);
        alert("No se pudo actualizar la dirección");
      }
    } else {
      // Añadir edificio en el backend
      try {
        const response = await fetch("http://127.0.0.1:8000/buildings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: nuevo.address }),
        });
        if (!response.ok) throw new Error("Error creando edificio");
        // Vuelvo a pedir la lista actualizada al backend
        const edificiosActualizados = await fetch("http://127.0.0.1:8000/buildings").then(res => res.json());
        setEdificios(edificiosActualizados);
      } catch (err) {
        console.error(err);
        alert("No se pudo crear el edificio");
      }
    }
    setShowModal(false);
    setEditingEdificio(null);
  };

  const handleDelete = async (id: number, address: string) => {
    if (!window.confirm(`¿Está seguro que desea eliminar el edificio en ${address}?`)) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/buildings/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error eliminando edificio");
      setEdificios(edificios.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el edificio");
    }
  };

  const handleEdit = (e: Edificio) => {
    setEditingEdificio(e);
    setShowModal(true);
  };

  return (
    <main className="main-container">
      <div className="table-container">
        <h2>Gestión de Edificios</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Dirección</th>
              <th>Departamentos</th>
              <th>Edición</th>
            </tr>
          </thead>
          <tbody>
            {edificios.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td>
                <td>{e.address}</td>
                <td>
                  <button
                    style={{ background: "#2ecc40", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}
                    onClick={() => navigate(`/departamentos/${e.id}`)}
                  >
                    Ver
                  </button>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button className="edit-btn" onClick={() => handleEdit(e)}>
                      Editar
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(e.id, e.address)}>
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