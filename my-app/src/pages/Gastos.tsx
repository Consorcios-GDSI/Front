import { useState, useEffect, useMemo } from "react";
import ModalGasto from "../components/ModalGasto";
import DataTable from "../components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "../hooks/useToast";
import { handleAPIError } from "../utils/errorHandler";
import { Apartment } from "../types/apartment";
import { Building } from "../types/building";
import { API_BASE_URL } from "../config";

interface Gasto {
  id: number;
  depto: string;
  tipo: string;
  monto: number;
  fecha: string;
  descripcion: string;
  building_id: number;
}

function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(1);
  const [showModal, setShowModal] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [loading, setLoading] = useState(false);
  const { success, error: showError, ToastContainer } = useToast();

  // Cargar datos iniciales desde el backend
  useEffect(() => {
    loadBuildings();
    loadApartments();
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      loadApartments();
      loadGastos();
    }
  }, [selectedBuildingId]);

  const loadBuildings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/buildings`);
      if (!response.ok) throw new Error("Error al cargar edificios");
      const data = await response.json();
      setBuildings(data);
      
      // Seleccionar el primer edificio por defecto
      if (data.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(data[0].id);
      }
    } catch (error) {
      console.error("Error cargando edificios:", error);
      showError("Error al cargar los edificios");
    }
  };

  const loadGastos = async () => {
    if (!selectedBuildingId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/expenses?building_id=${selectedBuildingId}`);
      if (!response.ok) throw new Error("Error al cargar gastos");
      const data = await response.json();
      
      // Transformar datos del backend al formato del frontend
      const gastosTransformados = data.map((expense: any) => ({
        id: expense.id,
        depto: expense.apartment_unit_number?.toString() || "-",
        tipo: expense.category,
        monto: expense.amount,
        fecha: expense.expense_date,
        descripcion: expense.description,
        building_id: expense.building_id
      }));
      
      setGastos(gastosTransformados);
    } catch (error) {
      console.error("Error cargando gastos:", error);
      showError("Error al cargar los gastos");
    } finally {
      setLoading(false);
    }
  };

  const loadApartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/apartments/${selectedBuildingId}`);
      if (!response.ok) throw new Error("Error al cargar departamentos");
      const data = await response.json();
      if (Array.isArray(data)) {
          data.sort((a: Apartment, b: Apartment) => (a.unit_number ?? 0) - (b.unit_number ?? 0));
        }
      setApartments(data);
      
      // Seleccionar el primer building_id disponible
      if (data.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(data[0].building_id);
      }
    } catch (error) {
      console.error("Error cargando departamentos:", error);
      showError("Error al cargar departamentos");
    }
  };

  const handleSave = async (nuevo: Omit<Gasto, "id" | "building_id">) => {
    try {
      if (!selectedBuildingId) {
        showError("No hay un edificio seleccionado");
        return;
      }

      // Transformar datos del frontend al formato del backend
      const expenseData = {
        description: nuevo.descripcion,
        amount: Number(nuevo.monto),
        category: nuevo.depto === "-" ? "GENERAL" : "INDIVIDUAL",
        building_id: selectedBuildingId,
        apartment_unit_number: nuevo.depto === "-" ? null : parseInt(nuevo.depto),
        expense_date: nuevo.fecha
      };

      console.log("Guardando gasto con datos:", expenseData);

      if (editingGasto) {
        // Actualizar gasto existente
        const response = await fetch(`${API_BASE_URL}/expenses/${editingGasto.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
          const errorMessage = await handleAPIError(response);
          throw new Error(errorMessage);
        }
        
        await loadGastos(); // Recargar la lista
        success("Gasto actualizado exitosamente");
        setEditingGasto(null);
      } else {
        // Crear nuevo gasto
        const response = await fetch(`${API_BASE_URL}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
          const errorMessage = await handleAPIError(response);
          throw new Error(errorMessage);
        }
        
        await loadGastos(); // Recargar la lista
        success("Gasto creado exitosamente");
      }
      
      setShowModal(false);
    } catch (error) {
      console.error("Error guardando gasto:", error);
      showError(error instanceof Error ? error.message : "Error al guardar el gasto");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este gasto?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorMessage = await handleAPIError(response);
        throw new Error(errorMessage);
      }
      
      await loadGastos(); // Recargar la lista
      success("Gasto eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando gasto:", error);
      showError(error instanceof Error ? error.message : "Error al eliminar el gasto");
    }
  };

  const handleEdit = (g: Gasto) => {
    setEditingGasto(g);
    setShowModal(true);
  };

  // Filtrar apartamentos del edificio seleccionado
  const apartmentsInBuilding = apartments.filter(a => a.building_id === selectedBuildingId);
  
  // Crear opciones que incluyan tanto el número como el nombre del departamento
  const availableDeptos = [
    { value: "-", label: "-" },
    ...apartmentsInBuilding.map(a => ({
      value: a.unit_number.toString(),
      label: `${a.unit_number} - ${a.apartment_name}`
    }))
  ];

  const columns = useMemo<ColumnDef<Gasto>[]>(
    () => [
      {
        accessorKey: "depto",
        header: "Nro Departamento",
        size: 120,
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
      },
      {
        accessorKey: "monto",
        header: "Monto ($)",
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: (info) => new Date(String(info.getValue())).toLocaleDateString("es-ES"),
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="action-buttons">
            <button className="edit-btn" onClick={() => handleEdit(row.original)}>
              Editar
            </button>
            <button className="delete-btn" onClick={() => handleDelete(row.original.id)}>
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
        <h2>Gestión de Gastos</h2>
        
        {/* Dropdown de edificios */}
        <div className="search-container" style={{ marginBottom: "20px" }}>
          <label htmlFor="building-select" style={{ marginRight: "10px", fontWeight: "bold" }}>
            Seleccionar Edificio:
          </label>
          <select
            id="building-select"
            value={selectedBuildingId || ""}
            onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
            style={{ padding: "8px", fontSize: "14px", borderRadius: '6px' }}
          >
            <option value="" disabled>Seleccione un edificio</option>
            {buildings.map(building => (
              <option key={building.id} value={building.id}>
                {building.address}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          data={gastos}
          columns={columns}
          loading={loading}
          emptyMessage="No hay gastos registrados para este edificio"
        />

        {/* Botón de añadir gasto debajo de la tabla */}
        <button className="add-btn" style={{ marginTop: "20px" }} onClick={() => { setShowModal(true); setEditingGasto(null); }}>
          Añadir gasto
        </button>
      </div>

      {showModal && (
        <ModalGasto
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingGasto(null); }}
          initialData={editingGasto ? {
            depto: editingGasto.depto,
            tipo: editingGasto.tipo,
            monto: editingGasto.monto,
            fecha: editingGasto.fecha,
            descripcion: editingGasto.descripcion
          } : undefined}
          availableDeptos={availableDeptos}
        />
      )}
    </main>
  );
}

export default Gastos;