import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import ModalEdificio from "../components/ModalEdificio";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import { ColumnDef } from "@tanstack/react-table";

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

  const columns = useMemo<ColumnDef<Edificio>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
      },
      {
        accessorKey: "address",
        header: "Dirección",
        cell: (info) => <strong>{String(info.getValue())}</strong>,
      },
      {
        id: "departamentos",
        header: "Departamentos",
        cell: ({ row }) => (
          <button
            className="view-btn"
            onClick={() => navigate(`/departamentos/${row.original.id}`)}
          >
            Ver Departamentos
          </button>
        ),
        enableSorting: false,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="action-buttons">
            <button className="edit-btn" onClick={() => handleEdit(row.original)}>
              Editar
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDelete(row.original.id, row.original.address)}
            >
              Eliminar
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [navigate]
  );

  return (
    <main className="main-container">
      <div className="table-container">
        <h2>Gestión de Edificios</h2>
        
        <DataTable
          data={edificios}
          columns={columns}
          emptyMessage="No hay edificios registrados"
        />
        
        <button
          className="add-btn"
          style={{ marginTop: "20px" }}
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