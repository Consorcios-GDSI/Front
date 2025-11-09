import { useState, useEffect, useMemo } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import ModalEdificio from "../components/ModalEdificio";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "../hooks/useToast";
import { handleAPIError } from "../utils/errorHandler";
import { Building } from "../types/building";
import { API_BASE_URL } from "../config";

function Edificios() {
  const [edificios, setEdificios] = useLocalStorage<Building[]>(
    "edificiosData",
    []
  );

  const [showModal, setShowModal] = useState(false);
  const [editingEdificio, setEditingEdificio] = useState<Building | null>(null);
  const navigate = useNavigate();
  const { success, error, ToastContainer } = useToast();

  useEffect(() => {
    fetch(`${API_BASE_URL}/buildings`)
      .then((res) => res.json())
      .then((data) => {
        setEdificios(data);
      })
      .catch((err) => {
        console.error("Error al cargar edificios:", err);
        error("Error al cargar los edificios");
      });
  }, []);

  const handleSave = async (nuevo: Building) => {
    if (editingEdificio) {
      // Editar dirección en el backend
      try {
        const response = await fetch(`${API_BASE_URL}/buildings/${editingEdificio.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: nuevo.address }),
        });
        if (!response.ok) {
          const errorMessage = await handleAPIError(response);
          throw new Error(errorMessage);
        }
        // Actualizar en frontend
        setEdificios(
          edificios.map((e) => (e.id === editingEdificio.id ? { ...e, address: nuevo.address } : e))
        );
        success("Edificio actualizado exitosamente");
      } catch (err) {
        console.error(err);
        error(err instanceof Error ? err.message : "No se pudo actualizar la dirección");
      }
    } else {
      // Añadir edificio en el backend
      try {
        const response = await fetch(`${API_BASE_URL}/buildings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: nuevo.address }),
        });
        if (!response.ok) {
          const errorMessage = await handleAPIError(response);
          throw new Error(errorMessage);
        }
        // Vuelvo a pedir la lista actualizada al backend
        const edificiosActualizados = await fetch(`${API_BASE_URL}/buildings`).then(res => res.json());
        setEdificios(edificiosActualizados);
        success("Edificio creado exitosamente");
      } catch (err) {
        console.error(err);
        error(err instanceof Error ? err.message : "No se pudo crear el edificio");
      }
    }
    setShowModal(false);
    setEditingEdificio(null);
  };

  const handleDelete = async (id: number, address: string) => {
    if (!window.confirm(`¿Está seguro que desea eliminar el edificio en ${address}?`)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/buildings/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorMessage = await handleAPIError(response);
        throw new Error(errorMessage);
      }
      setEdificios(edificios.filter((e) => e.id !== id));
      success("Edificio eliminado exitosamente");
    } catch (err) {
      console.error(err);
      error(err instanceof Error ? err.message : "No se pudo eliminar el edificio");
    }
  };

  const handleEdit = (e: Building) => {
    setEditingEdificio(e);
    setShowModal(true);
  };

  const columns = useMemo<ColumnDef<Building>[]>(
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
          <div
            className="action-buttons"
            style={{ display: "flex", justifyContent: "flex-start", gap: "8px", alignItems: "left" }}
          >
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
      <ToastContainer />
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