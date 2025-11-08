import { useState, useEffect } from "react";

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

interface Building {
  id: number;
  address: string;
}

interface Apartment {
  apartment_name: string;
  unit_number: number;
  building_id: number;
  resident_dni: number | null;
}

const API_BASE_URL = "http://127.0.0.1:8000";

const PAYMENT_STATUS_LABELS: { [key: string]: string } = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagado",
  overdue: "Vencido",
  credit: "Crédito",
};

const PAYMENT_STATUS_COLORS: { [key: string]: string } = {
  pending: "#FFA500",
  partial: "#FFD700",
  paid: "#28a745",
  overdue: "#dc3545",
  credit: "#17a2b8",
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
      alert("Error al cargar los edificios");
    }
  };

  const loadApartments = async () => {
    try {
      if (!selectedBuildingId) return;
      const response = await fetch(`${API_BASE_URL}/apartments/${selectedBuildingId}`);
      if (!response.ok) throw new Error("Error al cargar departamentos");
      const data = await response.json();
      setApartments(data);
    } catch (error) {
      console.error("Error cargando departamentos:", error);
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
        throw new Error("Error al cargar expensas");
      }
      
      const data = await response.json();
      setBillingStatements(data);
    } catch (error) {
      console.error("Error cargando expensas:", error);
      alert("Error al cargar las expensas");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (recalculate: boolean = false) => {
    if (!selectedBuildingId) {
      alert("Seleccione un edificio");
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
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al calcular expensas");
      }

      const data = await response.json();
      setBillingStatements(data);
      alert(`Expensas calculadas exitosamente para ${data.length} departamentos`);
    } catch (error: any) {
      console.error("Error calculando expensas:", error);
      alert(error.message || "Error al calcular las expensas");
    } finally {
      setCalculating(false);
    }
  };

  const handleReconcile = async () => {
    if (!selectedBuildingId) {
      alert("Seleccione un edificio");
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
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al reconciliar pagos");
      }

      const result = await response.json();
      await loadBillingStatements(); // Recargar datos
      
      alert(
        `Reconciliación completada:\n\n` +
        `Total reconciliado: $${result.total_reconciled?.toFixed(2) || 0}\n` +
        `Departamentos actualizados: ${result.reconciled_count || 0}`
      );
    } catch (error: any) {
      console.error("Error reconciliando pagos:", error);
      alert(error.message || "Error al reconciliar los pagos");
    } finally {
      setReconciling(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro que desea eliminar esta expensa?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/billing-statements/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar expensa");

      await loadBillingStatements();
    } catch (error) {
      console.error("Error eliminando expensa:", error);
      alert("Error al eliminar la expensa");
    }
  };

  // Obtener el nombre del departamento
  const getApartmentName = (unitNumber: number) => {
    const apt = apartments.find((a) => a.unit_number === unitNumber);
    return apt ? apt.apartment_name : "";
  };

  return (
    <main className="main-container">
      <div className="table-container">
        {/* Controles superiores */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Selector de Edificio */}
            <div>
              <label htmlFor="building-select" style={{ marginRight: "10px", fontWeight: "bold" }}>
                Edificio:
              </label>
              <select
                id="building-select"
                value={selectedBuildingId || ""}
                onChange={(e) => setSelectedBuildingId(Number(e.target.value))}
                style={{ padding: "8px", fontSize: "14px" }}
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

            {/* Selector de Período */}
            <div>
              <label style={{ marginRight: "10px", fontWeight: "bold" }}>Período:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{ padding: "8px", fontSize: "14px", marginRight: "5px" }}
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
                style={{ padding: "8px", fontSize: "14px", width: "100px" }}
                min="2000"
                max="2100"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="px-4 py-2 rounded-xl font-semibold shadow-md 
bg-gradient-to-r from-blue-500 to-blue-700 text-white 
hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 
transition-all"
              onClick={() => handleCalculate(false)}
              disabled={calculating}
              style={{ opacity: calculating ? 0.6 : 1 }}
            >
              {calculating ? "Calculando..." : "Calcular Expensas"}
            </button>
            <button
              className="px-4 py-2 rounded-xl font-semibold shadow-md 
bg-gradient-to-r from-blue-500 to-blue-700 text-white 
hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 
transition-all"
              onClick={() => handleCalculate(true)}
              disabled={calculating}
              style={{ opacity: calculating ? 0.6 : 1 }}
            >
              Recalcular
            </button>
            <button
              className="px-4 py-2 rounded-xl font-semibold shadow-md 
bg-gradient-to-r from-blue-500 to-blue-700 text-white 
hover:-translate-y-[1px] hover:shadow-lg active:translate-y-0 
transition-all"
              onClick={handleReconcile}
              disabled={reconciling}
              style={{ opacity: reconciling ? 0.6 : 1 }}
            >
              {reconciling ? "Reconciliando..." : "Reconciliar Pagos"}
            </button>
          </div>
        </div>

        {/* Tabla de expensas */}
        {loading ? (
          <p>Cargando expensas...</p>
        ) : billingStatements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ fontSize: "18px", color: "#666" }}>
              No hay expensas calculadas para este período.
            </p>
            <p style={{ fontSize: "14px", color: "#999" }}>
              Haga clic en "Calcular Expensas" para generar las expensas del período seleccionado.
            </p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Depto</th>
                <th>Nombre</th>
                <th>Gastos Particulares</th>
                <th>Gastos Comunes</th>
                <th>Saldo Anterior</th>
                <th>Intereses</th>
                <th>Crédito</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Saldo</th>
                <th>Estado</th>
                <th>Vencimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {billingStatements.map((bs) => (
                <tr key={bs.id}>
                  <td>{bs.apartment_unit_number}</td>
                  <td>{getApartmentName(bs.apartment_unit_number)}</td>
                  <td>${bs.particular_expenses.toFixed(2)}</td>
                  <td>${bs.shared_expenses.toFixed(2)}</td>
                  <td>${bs.previous_balance.toFixed(2)}</td>
                  <td>${bs.interest_charges.toFixed(2)}</td>
                  <td>${bs.previous_credit.toFixed(2)}</td>
                  <td style={{ fontWeight: "bold" }}>${bs.total_amount.toFixed(2)}</td>
                  <td>${bs.paid_amount.toFixed(2)}</td>
                  <td style={{ color: bs.balance < 0 ? "green" : bs.balance > 0 ? "red" : "black" }}>
                    ${bs.balance.toFixed(2)}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        backgroundColor: PAYMENT_STATUS_COLORS[bs.payment_status] || "#999",
                        color: "white",
                        fontSize: "12px",
                      }}
                    >
                      {PAYMENT_STATUS_LABELS[bs.payment_status] || bs.payment_status}
                    </span>
                  </td>
                  <td>{new Date(bs.due_date).toLocaleDateString("es-ES")}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(bs.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

export default Expensas;