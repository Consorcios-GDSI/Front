import { useState, useEffect } from "react";
import ModalPago from "../components/ModalPago";

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

interface Apartment {
  apartment_name: string;
  unit_number: number;
  building_id: number;
  resident_dni: number | null;
}

interface Building {
  id: number;
  address: string;
}

const API_BASE_URL = "http://127.0.0.1:8000";

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

  // Cargar datos iniciales desde el backend
  useEffect(() => {
    loadBuildings();
    loadApartments();
  }, []);

  // Cargar pagos cuando cambia el edificio seleccionado
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
      alert("Error al cargar los edificios");
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
      alert("Error al cargar los pagos");
    } finally {
      setLoading(false);
    }
  };

  const loadApartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/apartments/${selectedBuildingId}`);
      if (!response.ok) throw new Error("Error al cargar departamentos");
      const data = await response.json();
      setApartments(data);

      // Seleccionar el primer building_id disponible
      if (data.length > 0 && !selectedBuildingId) {
        setSelectedBuildingId(data[0].building_id);
      }
    } catch (error) {
      console.error("Error cargando departamentos:", error);
    }
  };

  const handleSave = async (nuevo: Omit<Pago, "id" | "building_id">) => {
    try {
      if (!selectedBuildingId) {
        alert("No hay un edificio seleccionado");
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

        if (!response.ok) throw new Error("Error al actualizar pago");

        await loadPagos(); // Recargar la lista
        setEditingPago(null);
      } else {
        // Crear nuevo pago
        const response = await fetch(`${API_BASE_URL}/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        });

        if (!response.ok) throw new Error("Error al crear pago");

        await loadPagos(); // Recargar la lista
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error guardando pago:", error);
      alert("Error al guardar el pago");
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

      if (!response.ok) throw new Error("Error al eliminar pago");

      await loadPagos(); // Recargar la lista
    } catch (error) {
      console.error("Error eliminando pago:", error);
      alert("Error al eliminar el pago");
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

  return (
    <main className="main-container">
      <div className="table-container">
        {/* Dropdown de edificios */}
        <div className="search-container">
          <label htmlFor="building-select" style={{ marginRight: "10px", fontWeight: "bold" }}>
            Seleccionar Edificio:
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

        {loading ? (
          <p>Cargando pagos...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nro Departamento</th>
                <th>Fecha</th>
                <th>Monto ($)</th>
                <th>Método de Pago</th>
                <th>Descripción</th>
                <th>Nro Referencia</th>
                <th>Edición</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.depto}</td>
                  <td>{p.fecha}</td>
                  <td>${p.monto.toFixed(2)}</td>
                  <td>{PAYMENT_METHOD_LABELS[p.metodo_pago] || p.metodo_pago}</td>
                  <td>{p.descripcion || "-"}</td>
                  <td>{p.numero_referencia || "-"}</td>
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
              ))}
            </tbody>
          </table>
        )}

        {/* Botón de añadir pago debajo de la tabla */}
        <button
          className="add-btn"
          style={{ marginTop: "20px" }}
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