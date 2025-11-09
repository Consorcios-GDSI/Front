import { useState, useEffect, useMemo } from "react";
import DataTable from "../components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "../hooks/useToast";
import { handleAPIError } from "../utils/errorHandler";
import { Apartment } from "../types/apartment";
import { Building } from "../types/building";
import { API_BASE_URL } from "../config";

interface BillingStatement {
  id: number;
  apartment_unit_number: number;
  building_id: number;
  period_month: number;
  period_year: number;
  particular_expenses: number;
  shared_expenses: number;
  previous_balance: number;
  interest_charges: number;
  previous_credit: number;
  total_amount: number;
  paid_amount: number;
  balance: number;
  payment_status: string;
  due_date: string;
  paid_date: string | null;
}

const PAYMENT_STATUS_LABELS: { [key: string]: string } = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
  overdue: "Vencido",
  credit: "Crédito",
};

const PAYMENT_STATUS_COLORS: { [key: string]: string } = {
  pending: "#4d3e2eff",
  partial: "#dc3545",
  paid: "#007bff",
  overdue: "#dc3545",
  credit: "#007bff",
};

function Expensas() {
  const [billingStatements, setBillingStatements] = useState<BillingStatement[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const { success, error: showError, ToastContainer } = useToast();

  // Cargar datos iniciales
  useEffect(() => {
    loadBuildings();
    loadApartments();
  }, []);

  // Cargar billing statements cuando cambia el edificio o periodo
  useEffect(() => {
    if (selectedBuildingId && selectedMonth && selectedYear) {
      loadBillingStatements();
    }
  }, [selectedBuildingId, selectedMonth, selectedYear]);

  const loadBuildings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/buildings`);
      if (!response.ok) throw new Error("Error al cargar edificios");
      const data = await response.json();
      setBuildings(data);

      if (data.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(data[0].id);
      }
    } catch (error) {
      console.error("Error cargando edificios:", error);
      showError("Error al cargar los edificios");
    }
  };

  const loadApartments = async () => {
    try {
      if (!selectedBuildingId) return;
      const response = await fetch(`${API_BASE_URL}/apartments/${selectedBuildingId}`);
      if (!response.ok) throw new Error("Error al cargar departamentos");
      const data = await response.json();
      if (Array.isArray(data)) {
        data.sort((a: Apartment, b: Apartment) => (a.unit_number ?? 0) - (b.unit_number ?? 0));
      }
      setApartments(data);
    } catch (error) {
      console.error("Error cargando departamentos:", error);
      showError("Error al cargar departamentos");
    }
  };

  const loadBillingStatements = async () => {
    if (!selectedBuildingId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/billing-statements/building/${selectedBuildingId}?period_month=${selectedMonth}&period_year=${selectedYear}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          setBillingStatements([]);
          return;
        }
        const errorMessage = await handleAPIError(response);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setBillingStatements(data);
    } catch (error) {
      console.error("Error cargando expensas:", error);
      showError(error instanceof Error ? error.message : "Error al cargar las expensas");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (recalculate: boolean = false) => {
    if (!selectedBuildingId) {
      showError("Seleccione un edificio");
      return;
    }

    const confirmMessage = recalculate
      ? "¿Está seguro que desea RECALCULAR las expensas? Esto sobrescribirá las existentes."
      : "¿Está seguro que desea calcular las expensas para este período?";

    if (!window.confirm(confirmMessage)) return;

    try {
      setCalculating(true);
      const response = await fetch(
        `${API_BASE_URL}/billing-statements/calculate?recalculate=${recalculate}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            building_id: selectedBuildingId,
            period_month: selectedMonth,
            period_year: selectedYear,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await handleAPIError(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setBillingStatements(data);
      success(`Expensas calculadas exitosamente para ${data.length} departamentos`);
    } catch (error: any) {
      console.error("Error calculando expensas:", error);
      showError(error instanceof Error ? error.message : "Error al calcular las expensas");
    } finally {
      setCalculating(false);
    }
  };

  const handleReconcile = async () => {
    if (!selectedBuildingId) {
      showError("Seleccione un edificio");
      return;
    }

    if (!window.confirm(
      "¿Está seguro que desea reconciliar los pagos?\n\n" +
      "Esto actualizará el estado de pago de cada expensa comparando los pagos recibidos con el monto total."
    )) return;

    try {
      setReconciling(true);
      const response = await fetch(`${API_BASE_URL}/billing-statements/reconcile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building_id: selectedBuildingId,
          period_month: selectedMonth,
          period_year: selectedYear,
          interest_rate: 0.03, // 3% mensual
        }),
      });

      if (!response.ok) {
        const errorMessage = await handleAPIError(response);
        throw new Error(errorMessage);
      }

      await loadBillingStatements(); // Recargar datos
      
      success(
        `Cierre completado`
      );
    } catch (error: any) {
      console.error("Error reconciliando pagos:", error);
      showError(error instanceof Error ? error.message : "Error al reconciliar los pagos");
    } finally {
      setReconciling(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar esta expensa?")) {
      return;
    }

    try {
      console.log('Before delete - Month:', selectedMonth, 'Year:', selectedYear);
      const response = await fetch(`${API_BASE_URL}/billing-statements/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorMessage = await handleAPIError(response);
        throw new Error(errorMessage);
      }

      console.log('After delete - Month:', selectedMonth, 'Year:', selectedYear);
      await loadBillingStatements();
      console.log('After reload - Month:', selectedMonth, 'Year:', selectedYear);
      success("Expensa eliminada exitosamente");
    } catch (error) {
      console.error("Error eliminando expensa:", error);
      showError(error instanceof Error ? error.message : "Error al eliminar la expensa");
    }
  };

  // Obtener el nombre del departamento
  const getApartmentName = (unitNumber: number) => {
    const apt = apartments.find((a) => a.unit_number === unitNumber);
    return apt ? apt.apartment_name : "";
  };

  const columns = useMemo<ColumnDef<BillingStatement>[]>(
    () => [
      {
        accessorKey: "apartment_unit_number",
        header: "Depto",
        size: 80,
      },
      {
        id: "nombre",
        header: "Nombre",
        cell: ({ row }) => getApartmentName(row.original.apartment_unit_number),
      },
      {
        accessorKey: "particular_expenses",
        header: "Gastos Particulares",
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "shared_expenses",
        header: "Gastos Comunes",
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "previous_balance",
        header: "Saldo Anterior",
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "interest_charges",
        header: "Intereses",
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "previous_credit",
        header: "Crédito",
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "total_amount",
        header: "Total",
        cell: (info) => <strong>${Number(info.getValue()).toFixed(2)}</strong>,
      },
      {
        accessorKey: "paid_amount",
        header: "Pagado",
        cell: (info) => `$${Number(info.getValue()).toFixed(2)}`,
      },
      {
        accessorKey: "balance",
        header: "Saldo",
        cell: (info) => {
          const value = Number(info.getValue());
          return (
            <span style={{ color: value < 0 ? PAYMENT_STATUS_COLORS["credit"] : value > 0 ? "red" : "black" }}>
              ${value.toFixed(2)}
            </span>
          );
        },
      },
      {
        accessorKey: "payment_status",
        header: "Estado",
        cell: (info) => {
          const status = String(info.getValue());
          return (
            <span
              style={{
                padding: "4px 8px",
                width: "100%",
                borderRadius: "20px",
                backgroundColor: PAYMENT_STATUS_COLORS[status] || "#999",
                color: "white",
                fontSize: "12px",
                whiteSpace: "nowrap",
              }}
            >
              {PAYMENT_STATUS_LABELS[status] || status}
            </span>
          );
        },
      },
      {
        accessorKey: "due_date",
        header: "Vencimiento",
        cell: (info) => new Date(String(info.getValue())).toLocaleDateString("es-ES"),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
          <button className="btn-fancy"
            style={{ ['--btn-hover' as any]: '#dc3545' } as React.CSSProperties}
            onClick={() => handleDelete(row.original.id)}>
            Eliminar
          </button>
        ),
        enableSorting: false,
      },
    ],
    [apartments]
  );

  return (
    <main className="main-container">
      <ToastContainer />
      <div className="table-container">
        <h2>Gestión de Expensas</h2>
        
        {/* Controles superiores */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Grupo de selects */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            {/* Edificio */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label htmlFor="building-select" style={{ fontWeight: "bold" }}>Edificio:</label>
              <select
                id="building-select"
                value={selectedBuildingId || ""}
                onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
                className="search-input"
                style={{ maxWidth: "200px" }}
              >
                <option value="" disabled>Seleccione un edificio</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.address}
                  </option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontWeight: "bold" }}>Período:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="search-input"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>
                    {new Date(2000, month - 1).toLocaleString("es-ES", { month: "long" })}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="search-input"
                min="2000"
                max="2100"
                style={{ width: "100px" }}
              />
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="btn-fancy"
              onClick={() => handleCalculate(false)}
              disabled={calculating}
              style={{ opacity: calculating ? 0.6 : 1 }}
            >
              {calculating ? "Calculando..." : "Calcular Expensas"}
            </button>
            <button
              className="btn-fancy"
              style={{ opacity: reconciling ? 0.6 : 1 }}
              onClick={() => handleCalculate(true)}
              disabled={calculating}
            >
              Recalcular
            </button>
            <button
              className="btn-fancy"
              style={{ opacity: reconciling ? 0.6 : 1 }}
              onClick={handleReconcile}
              disabled={reconciling}
            >
              {reconciling ? "Reconciliando..." : "Reconciliar Pagos"}
            </button>
          </div>
        </div>


        {/* Tabla de expensas */}
        {billingStatements.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ fontSize: "18px", color: "#666" }}>
              No hay expensas calculadas para este período.
            </p>
            <p style={{ fontSize: "14px", color: "#999" }}>
              Haga clic en "Calcular Expensas" para generar las expensas del período seleccionado.
            </p>
          </div>
        ) : (
          <DataTable
            data={billingStatements}
            columns={columns}
            loading={loading}
            emptyMessage="No hay expensas calculadas para este período"
          />
        )}
      </div>
    </main>
  );
}

export default Expensas;