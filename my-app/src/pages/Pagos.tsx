import { useState, useEffect, useMemo } from "react";
import ModalPago from "../components/ModalPago";
import DataTable from "../components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "../hooks/useToast";
import { handleAPIError } from "../utils/errorHandler";
import { Apartment } from "../types/apartment";
import { Building } from "../types/building";
import { API_BASE_URL } from "../config";

interface Pago {
  id: number;
  depto: string;
  fecha: string;
  monto: number;
  metodo_pago: string;
  descripcion: string;
  numero_referencia: string;
  building_id: number;
}

const PAYMENT_METHOD_LABELS: { [key: string]: string } = {
  cash: "Efectivo",
  transfer: "Transferencia",
  credit_card: "Tarjeta de Crédito",
  debit_card: "Tarjeta de Débito",
};

function Pagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPago, setEditingPago] = useState<Pago | null>(null);
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
      loadPagos();
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

  const loadPagos = async () => {
    if (!selectedBuildingId) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/payments?building_id=${selectedBuildingId}`);
      if (!response.ok) throw new Error("Error al cargar pagos");
      const data = await response.json();

      // Transformar datos del backend al formato del frontend
      const pagosTransformados = data.map((payment: any) => ({
        id: payment.id,
        depto: payment.apartment_unit_number.toString(),
        monto: payment.amount,
        fecha: payment.payment_date,
        metodo_pago: payment.payment_method,
        descripcion: payment.description || "",
        numero_referencia: payment.reference_number || "",
        building_id: payment.building_id,
      }));

      setPagos(pagosTransformados);
    } catch (error) {
      console.error("Error cargando pagos:", error);
      showError("Error al cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const loadApartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/apartments/${selectedBuildingId}`);
      if (!response.ok) throw new Error("Error al cargar departamentos");
      const data = await response.json();
      // Ordenar departamentos por unit_number ascendente antes de guardarlos en estado
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

  const handleSave = async (nuevo: Omit<Pago, "id" | "building_id">) => {
    try {
      if (!selectedBuildingId) {
        showError("No hay un edificio seleccionado");
        return;
      }

      // Transformar datos del frontend al formato del backend
      const paymentData = {
        amount: Number(nuevo.monto),
        payment_method: nuevo.metodo_pago,
        building_id: selectedBuildingId,
        apartment_unit_number: parseInt(nuevo.depto),
        description: nuevo.descripcion,
        reference_number: nuevo.numero_referencia,
        payment_date: nuevo.fecha,
      };

      console.log("Guardando pago con datos:", paymentData);

      if (editingPago) {
        // Actualizar pago existente
        const response = await fetch(`${API_BASE_URL}/payments/${editingPago.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          const errorMessage = await handleAPIError(response);
          throw new Error(errorMessage);
        }

        await loadPagos(); // Recargar la lista
        success("Pago actualizado exitosamente");
        setEditingPago(null);
      } else {
        // Crear nuevo pago
        const response = await fetch(`${API_BASE_URL}/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
          const errorMessage = await handleAPIError(response);
          throw new Error(errorMessage);
        }

        await loadPagos(); // Recargar la lista
        success("Pago creado exitosamente");
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error guardando pago:", error);
      showError(error instanceof Error ? error.message : "Error al guardar el pago");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar este pago?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorMessage = await handleAPIError(response);
        throw new Error(errorMessage);
      }

      await loadPagos(); // Recargar la lista
      success("Pago eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando pago:", error);
      showError(error instanceof Error ? error.message : "Error al eliminar el pago");
    }
  };

  const handleEdit = (p: Pago) => {
    setEditingPago(p);
    setShowModal(true);
  };

  // Filtrar apartamentos del edificio seleccionado
  const apartmentsInBuilding = apartments.filter((a) => a.building_id === selectedBuildingId);

  // Crear opciones que incluyan tanto el número como el nombre del departamento
  const availableDeptos = apartmentsInBuilding.map((a) => ({
    value: a.unit_number.toString(),
    label: `${a.unit_number} - ${a.apartment_name}`,
  }));

  const columns = useMemo<ColumnDef<Pago>[]>(
    () => [
      {
        accessorKey: "depto",
        header: "Nro Departamento",
        size: 120,
      },
      {
        accessorKey: "fecha",
        header: "Fecha",
        cell: (info) => new Date(String(info.getValue())).toLocaleDateString("es-ES"),
      },
      {
        accessorKey: "metodo_pago",
        header: "Método de Pago",
        cell: (info) => PAYMENT_METHOD_LABELS[String(info.getValue())] || String(info.getValue()),
      },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: (info) => String(info.getValue() || "-"),
      },
      {
        accessorKey: "numero_referencia",
        header: "Nro Referencia",
        cell: (info) => String(info.getValue() || "-"),
      },
      {
        accessorKey: "monto",
        header: "Monto ($)",
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-fancy" onClick={() => handleEdit(row.original)}>
              Editar
            </button>
            <button
              className="btn-fancy"
              style={{ ['--btn-hover' as any]: '#dc3545' } as React.CSSProperties}
              onClick={() => handleDelete(row.original.id)}
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
        <h2>Gestión de Pagos</h2>
        
        {/* Dropdown de edificios */}
        <div className="search-container" style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
          <label htmlFor="building-select" style={{ marginRight: "10px", fontWeight: "bold" }}>
            Edificio:
          </label>
          <select
            id="building-select"
            value={selectedBuildingId || ""}
            onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
            className="search-input"
          >
            <option value="" disabled>
              Seleccione un edificio
            </option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.address}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          data={pagos}
          columns={columns}
          loading={loading}
          emptyMessage="No hay pagos registrados para este edificio"
        />

        {/* Botón de añadir pago debajo de la tabla */}
        <button
          className="btn-fancy"   
          onClick={() => {
            setShowModal(true);
            setEditingPago(null);
          }}
        >
          Añadir Pago
        </button>
      </div>

      {showModal && (
        <ModalPago
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditingPago(null);
          }}
          initialData={
            editingPago
              ? {
                  depto: editingPago.depto,
                  monto: editingPago.monto,
                  fecha: editingPago.fecha,
                  metodo_pago: editingPago.metodo_pago,
                  descripcion: editingPago.descripcion,
                  numero_referencia: editingPago.numero_referencia,
                }
              : undefined
          }
          availableDeptos={availableDeptos}
        />
      )}
    </main>
  );
}

export default Pagos;