import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ModalDepartamento from "../components/ModalDepartamento";

interface Departamento {
  apartment_name: string;
  unit_number: number;
  resident_dni: number | null;
  building_id: number;
}

interface DepartamentoForm {
  apartment_name: string;
  unit_number: number;
  building_id: number;
}

function Departamentos() {
  const { id } = useParams();
  const buildingId = Number(id);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchDepartamentos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/apartments/${buildingId}`);
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
      const response = await fetch("http://127.0.0.1:8000/apartments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });
      if (!response.ok) throw new Error("Error creando departamento");
      await fetchDepartamentos();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el departamento");
    }
  };

  const handleDelete = async (unitNumber: number, apartmentName: string) => {
    if (!window.confirm(`¿Está seguro que desea eliminar el departamento ${apartmentName}?`)) return;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/apartments/${buildingId}/${unitNumber}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Error eliminando departamento");
      await fetchDepartamentos();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el departamento");
    }
  };

  const handleUnassignResident = async (unitNumber: number, apartmentName: string) => {
    if (!window.confirm(`¿Está seguro que desea desasignar el residente del departamento ${apartmentName}?`)) return;
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/apartments/${buildingId}/${unitNumber}`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) throw new Error("Error desasignando residente");
      await fetchDepartamentos();
    } catch (err) {
      console.error(err);
      alert("No se pudo desasignar el residente");
    }
  };

  return (
    <main className="main-container">
      <div className="table-container">
        <h2>Departamentos del Edificio {buildingId}</h2>
        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando...</p>
        ) : error ? (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre Departamento</th>
                <th>Número de Unidad</th>
                <th>DNI del Residente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {departamentos.map((d, idx) => (
                <tr key={idx}>
                  <td>{d.apartment_name}</td>
                  <td>{d.unit_number}</td>
                  <td>{d.resident_dni ?? "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {d.resident_dni && (
                        <button 
                          className="edit-btn" 
                          onClick={() => handleUnassignResident(d.unit_number, d.apartment_name)}
                          title="Desasignar residente"
                        >
                          Desasignar
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(d.unit_number, d.apartment_name)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
