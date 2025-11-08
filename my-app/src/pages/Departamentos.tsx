import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Departamento {
  apartment_name: string;
  unit_number: number;
  resident_dni: number;
  building_id: number;
}

function Departamentos() {
  const { id } = useParams();
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [apartmentName, setApartmentName] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/apartments/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener departamentos");
        return res.json();
      })
      .then((data) => {
        setDepartamentos(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddDepartamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!apartmentName.trim() || !unitNumber.trim()) {
      setFormError("Todos los campos son obligatorios");
      return;
    }
    const body = {
      apartment_name: apartmentName,
      unit_number: Number(unitNumber),
      building_id: Number(id),
    };
    try {
      const response = await fetch("http://127.0.0.1:8000/apartments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Error al añadir departamento");
      // Actualizar la lista
      const nuevosDepartamentos = await fetch(`http://127.0.0.1:8000/apartments/${id}`).then(res => res.json());
      setDepartamentos(nuevosDepartamentos);
      setShowForm(false);
      setApartmentName("");
      setUnitNumber("");
    } catch (err) {
      setFormError("No se pudo añadir el departamento");
    }
  };

  return (
    <main className="main-container">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Departamentos del Edificio {id}</h2>
        <button
          style={{ marginBottom: "20px", background: "#007bff", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}
          onClick={() => setShowForm(!showForm)}
        >
          Añadir departamento
        </button>
        {showForm && (
          <form onSubmit={handleAddDepartamento} style={{ marginBottom: "20px", minWidth: "300px", background: "#f9f9f9", padding: "16px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ marginBottom: "10px" }}>
              <label>Nombre del departamento:</label>
              <input
                type="text"
                value={apartmentName}
                onChange={e => setApartmentName(e.target.value)}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
                required
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Número de unidad:</label>
              <input
                type="number"
                value={unitNumber}
                onChange={e => setUnitNumber(e.target.value)}
                style={{ width: "100%", padding: "6px", marginTop: "4px" }}
                required
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>ID del edificio:</label>
              <input
                type="number"
                value={id}
                disabled
                style={{ width: "100%", padding: "6px", marginTop: "4px", background: "#eee" }}
              />
            </div>
            {formError && <p style={{ color: "red", textAlign: "center" }}>{formError}</p>}
            <button type="submit" style={{ background: "#2ecc40", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", width: "100%" }}>
              Guardar
            </button>
          </form>
        )}
        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando...</p>
        ) : error ? (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        ) : (
          <div className="table-container">
            <table style={{ margin: "0 auto", minWidth: "400px" }}>
              <thead>
                <tr>
                  <th>Nombre Departamento</th>
                  <th>Número de Unidad</th>
                  <th>DNI del Residente</th>
                </tr>
              </thead>
              <tbody>
                {departamentos.map((d, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center" }}>{d.apartment_name}</td>
                    <td style={{ textAlign: "center" }}>{d.unit_number}</td>
                    <td style={{ textAlign: "center" }}>{d.resident_dni}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default Departamentos;
