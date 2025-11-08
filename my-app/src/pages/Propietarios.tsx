import { useState, useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
// Modal existente para alta/edición
import PropietarioModal from "../components/Modal";
import DataTable from "../components/DataTable"; 

// Tipos, interfaces y datos simulados
interface Department {
  number: string;
}

interface Building {
  id: number;
  nombre: string;
  departments: Department[]; // Estructura completa si se necesitara
}

interface Propietario {
  id: number;
  name: string;
  dni: number;
  telephone: string;
  mail: string;
  depto?: string;
  building_id?: number;
}

// Ya no usamos departamentos locales; el modal los carga vía API

function Propietarios() {
  // Lista de propietarios (residentes) obtenidos del backend
  const [propietarios, setPropietarios] = useState<Propietario[]>([]);
  // Lista de edificios obtenida del backend (reemplaza localStorage)
  const [edificios, setEdificios] = useState<Building[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingPropietario, setEditingPropietario] = useState<Propietario | null>(null);
  const [currentApartments, setCurrentApartments] = useState<any[]>([]);
  const [isAddingApartment, setIsAddingApartment] = useState(false); // Nuevo: para modal de agregar departamento

  // Lista simple para el select del modal
  const buildingsList = edificios.map(e => ({ id: e.id, nombre: e.nombre }));

  // Sin mapeo local de departamentos; el modal hará fetch dinámico

  // Convertir propietario a formato que espera el Modal (nombre completo en 'nombre')
  const propietarioToForm = (p: Propietario) => ({
    nombre: p.name,
    telefono: p.telephone,
    mail: p.mail,
    depto: p.depto ?? "",
    building_id: p.building_id ?? 0,
    dni: p.dni,
  });

  // Cargar residentes y edificios desde backend
  const fetchData = async () => {
    try {
      const [residentsRes, buildingsRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/residents"),
        fetch("http://127.0.0.1:8000/buildings")
      ]);

      const residentesData = await residentsRes.json();
      const edificiosData = await buildingsRes.json();

      const propietariosBackend: Propietario[] = residentesData.map((r: any) => ({
        id: r.dni,
        name: r.name,
        dni: r.dni,
        telephone: String(r.telephone),
        mail: r.mail,
        depto: r.unit_number ? String(r.unit_number) : undefined,
        building_id: r.building_id,
      }));
      setPropietarios(propietariosBackend);
      setEdificios(edificiosData.map((b: any) => ({
        id: b.id,
        nombre: b.name || b.nombre || `Edificio ${b.id}`,
        departments: [],
      })));
    } catch (err) {
      console.error("Error cargando data:", err);
      alert("Error al cargar edificios o residentes");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Alta / edición de propietario usando backend (nombre completo en name)
  const handleSave = async (nuevo: any) => {
  const nombreCompleto: string = nuevo.nombre || nuevo.name || ""; // Modal envía 'nombre' (completo)
  const dni = nuevo.dni;
  const telephone = parseInt(nuevo.telefono, 10);
  const mail = nuevo.mail;
  const building_id = nuevo.building_id;
  const unit_number = nuevo.depto ? parseInt(nuevo.depto, 10) : undefined;

    // Caso: Agregar departamento a propietario existente
    if (isAddingApartment && editingPropietario) {
      try {
        if (!building_id || !unit_number) {
          alert("Seleccione edificio y departamento");
          return;
        }
        // Usar los datos del propietario existente
        const createData = { 
          dni: editingPropietario.dni, 
          name: editingPropietario.name, 
          telephone: parseInt(editingPropietario.telephone, 10), 
          mail: editingPropietario.mail 
        };
        const res = await fetch(`http://127.0.0.1:8000/residents/${building_id}/${unit_number}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createData),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Error agregando departamento");
        }
        await fetchData();
        setShowModal(false);
        setIsAddingApartment(false);
        setEditingPropietario(null);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "No se pudo agregar el departamento");
      }
      return;
    }

    if (editingPropietario) {
      // PUT /residents/{dni}
      try {
        // Usar los valores old_ que vienen del modal (seleccionados por el usuario)
        const oldBuildingId = nuevo.old_building_id;
        const oldUnitNumber = nuevo.old_depto ? parseInt(nuevo.old_depto, 10) : undefined;
        
        // Validar que tengamos los datos old_ necesarios
        if (!oldBuildingId || !oldUnitNumber) {
          alert("Debe seleccionar un departamento actual");
          return;
        }
        
        // Si building_id es 0 o no hay depto, enviar null para no modificar el departamento
        const newBuildingId = (building_id && building_id !== 0 && unit_number) ? building_id : null;
        const newUnitNumber = (building_id && building_id !== 0 && unit_number) ? unit_number : null;
        
        const updateData = {
          dni: editingPropietario.dni,
          name: nombreCompleto,
          telephone,
          mail,
          old_building_id: oldBuildingId,
          old_unit_number: oldUnitNumber,
          new_building_id: newBuildingId,
          new_unit_number: newUnitNumber,
        };
        const res = await fetch(`http://127.0.0.1:8000/residents/${editingPropietario.dni}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Error actualizando propietario");
        }
        await fetchData();
        setShowModal(false);
        setEditingPropietario(null);
        setCurrentApartments([]);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "No se pudo actualizar");
      }
    } else {
      // POST /residents/{building_id}/{unit_number}
      try {
        if (!building_id || !unit_number) {
          alert("Seleccione edificio y departamento");
          return;
        }
        const createData = { dni, name: nombreCompleto, telephone, mail };
        const res = await fetch(`http://127.0.0.1:8000/residents/${building_id}/${unit_number}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createData),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || "Error creando propietario");
        }
        await fetchData();
        setShowModal(false);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : "No se pudo crear");
      }
    }
  };

  const handleDelete = async (dni: number, name: string) => {
    // DELETE /residents/{dni} - Eliminar propietario
    if (!window.confirm(`¿Está seguro que desea eliminar al propietario ${name}?`)) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/residents/${dni}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error eliminando propietario");
      }

      await fetchData();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "No se pudo eliminar el propietario");
    }
  };

  const handleEdit = async (p: Propietario) => {
    // Obtener los departamentos del residente antes de abrir el modal
    try {
      const response = await fetch(`http://127.0.0.1:8000/apartments/dni/${p.dni}`);
      if (!response.ok) {
        throw new Error("Error obteniendo departamentos del residente");
      }
      const apartments = await response.json();
      
      // Guardar los departamentos en el estado
      setCurrentApartments(apartments);
      
      // Si tiene departamentos, usar el primero como referencia
      if (apartments.length > 0) {
        const firstApartment = apartments[0];
        p.building_id = firstApartment.building_id;
        p.depto = String(firstApartment.unit_number);
      }
      
      setEditingPropietario(p);
      setIsAddingApartment(false);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Error al cargar los departamentos del residente");
    }
  };

  const handleAddApartment = (p: Propietario) => {
    // Abrir modal para agregar departamento sin necesidad de cargar los actuales
    setEditingPropietario(p);
    setIsAddingApartment(true);
    setCurrentApartments([]);
    setShowModal(true);
  };

  const columns = useMemo<ColumnDef<Propietario>[]>(
    () => [
      {
        accessorKey: "dni",
        header: "DNI",
      },
      {
        accessorKey: "name",
        header: "Nombre",
      },
      {
        accessorKey: "telephone",
        header: "Teléfono",
      },
      {
        accessorKey: "mail",
        header: "Mail",
      },
      {
        id: "edicion",
        header: "Edición",
        cell: ({ row }) => (
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="edit-btn" onClick={() => handleEdit(row.original)}>
              Editar
            </button>
            <button 
              className="add-apartment-btn" 
              onClick={() => handleAddApartment(row.original)}
              style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              + Depto
            </button>
            <button className="delete-btn" onClick={() => handleDelete(row.original.dni, row.original.name)}>
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
      <div className="table-container">
        <DataTable
          data={propietarios}
          columns={columns}
          emptyMessage="No hay propietarios registrados"
        />
        <button
          className="add-btn"
          onClick={() => {
            setEditingPropietario(null);
            setCurrentApartments([]);
            setShowModal(true);
          }}
        >
          Añadir propietario
        </button>
      </div>

    {showModal && (
      <PropietarioModal
        onSave={handleSave}
        onClose={() => { setShowModal(false); setEditingPropietario(null); setCurrentApartments([]); setIsAddingApartment(false); }}
        initialData={editingPropietario ? propietarioToForm(editingPropietario) : undefined}
        isNew={!editingPropietario || isAddingApartment}
        buildings={buildingsList}
        currentApartments={currentApartments}
        isAddingApartment={isAddingApartment}
      />
    )}
    </main>
  );
}

export default Propietarios;
