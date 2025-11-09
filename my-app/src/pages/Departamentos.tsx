import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import ModalDepartamento from "../components/ModalDepartamento";
import DataTable from "../components/DataTable";
import { useToast } from "../hooks/useToast";
import { handleAPIError } from "../utils/errorHandler";
import { Apartment } from "../types/apartment";
import { API_BASE_URL } from "../config";

interface DepartamentoForm {
  apartment_name: string;
  unit_number: number;
  building_id: number;
}

function Departamentos() {
  const { id } = useParams();
  const buildingId = Number(id);
  const [departamentos, setDepartamentos] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { success, error: showError, ToastContainer } = useToast();

  const fetchDepartamentos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/apartments/${buildingId}`);
      if (!res.ok) throw new Error("Error al obtener departamentos");
      const data = await res.json();
      setDepartamentos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, [buildingId]);

  const handleSave = async (nuevo: DepartamentoForm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/apartments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });
      if (!response.ok) {
        const errorMessage = await handleAPIError(response);
        throw new Error(errorMessage);
      }
      await fetchDepartamentos();
      success("Departamento creado exitosamente");
      setShowModal(false);
    } catch (err) {
      console.error(err);
      showError(err instanceof Error ? err.message : "No se pudo crear el departamento");
    }
  };

  const handleDelete = async (unitNumber: number, apartmentName: string) => {
    if (!window.confirm(`¿Está seguro que desea eliminar el departamento ${apartmentName}?`)) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/apartments/${buildingId}/${unitNumber}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const errorMessage = await handleAPIError(response);
        throw new Error(errorMessage);
      }
      await fetchDepartamentos();
      success("Departamento eliminado exitosamente");
    } catch (err) {
      console.error(err);
      showError(err instanceof Error ? err.message : "No se pudo eliminar el departamento");
    }
  };

  const handleUnassignResident = async (unitNumber: number, apartmentName: string) => {
    if (!window.confirm(`¿Está seguro que desea desasignar el residente del departamento ${apartmentName}?`)) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/apartments/${buildingId}/${unitNumber}`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) {
        const errorMessage = await handleAPIError(response);
        throw new Error(errorMessage);
      }
      await fetchDepartamentos();
      success("Residente desasignado exitosamente");
    } catch (err) {
      console.error(err);
      showError(err instanceof Error ? err.message : "No se pudo desasignar el residente");
    }
  };

  const columns = useMemo<ColumnDef<Apartment>[]>(
    () => [
      {
        accessorKey: "apartment_name",
        header: "Nombre Departamento",
      },
      {
        accessorKey: "unit_number",
        header: "Número de Unidad",
      },
      {
        accessorKey: "resident_dni",
        header: "DNI del Residente",
        cell: (info) => info.getValue() ?? "-",
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div style={{ display: "flex", gap: "10px" }}>
            {row.original.resident_dni && (
              <button 
                className="edit-btn" 
                onClick={() => handleUnassignResident(row.original.unit_number, row.original.apartment_name)}
                title="Desasignar residente"
              >
                Desasignar
              </button>
            )}
            <button
              className="delete-btn"
              onClick={() => handleDelete(row.original.unit_number, row.original.apartment_name)}
            >
              Eliminar
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    []
  );

  return (
    <main className="main-container">
      <ToastContainer />
      <div className="table-container">
        <h2>Departamentos del Edificio {buildingId}</h2>
        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando...</p>
        ) : error ? (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        ) : (
          <DataTable
            data={departamentos}
            columns={columns}
            emptyMessage="No hay departamentos en este edificio"
          />
        )}
        <button
          className="add-btn"
          onClick={() => setShowModal(true)}
        >
          Añadir Departamento
        </button>
      </div>

      {showModal && (
        <ModalDepartamento
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          buildingId={buildingId}
        />
      )}
    </main>
  );
}

export default Departamentos;
