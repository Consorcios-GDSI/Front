import { useState } from "react";
import Modal from "../components/Modal";

interface Propietario {
  id: number;
  nombre: string;
  apellido: string;
  telefono: string;
  mail: string;
  depto: string;
  saldo: number;
}

function Propietarios() {
  const [propietarios, setPropietarios] = useState<Propietario[]>([
    { id: 1, nombre: "Juan", apellido: "Pérez", telefono: "123456789", mail: "juan@mail.com", depto: "101", saldo: 5000 },
    { id: 2, nombre: "María", apellido: "Gómez", telefono: "987654321", mail: "maria@mail.com", depto: "102", saldo: 3000 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingPropietario, setEditingPropietario] = useState<Propietario | null>(null);

  const handleSave = (nuevo: Omit<Propietario, "id">) => {
    if (editingPropietario) {
      // Editar existente
      // Se debería validar el nuevo input llamando a la api
      setPropietarios(propietarios.map(p => p.id === editingPropietario.id ? { ...p, ...nuevo } : p));
      setEditingPropietario(null);
    } else {
      // Agregar nuevo
      // Se debería validar el input llamando a la api
      setPropietarios([...propietarios, { id: Date.now(), ...nuevo }]);
    }
    setShowModal(false);
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm('¿Está seguro que desea eliminar este propietario?')) {
      // Aquí deberías hacer la llamada a la API para eliminar
      setPropietarios(propietarios.filter(p => p.id !== id));
    }
  };

  const handleEdit = (p: Propietario) => {
    setEditingPropietario(p);
    setShowModal(true);
  };

  return (
    <main className="main-container">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Teléfono</th>
              <th>Mail</th>
              <th>Nro Departamento</th>
              <th>Saldo</th>
              <th>Edición</th>
            </tr>
          </thead>
          <tbody>
            {propietarios.map((p) => (
              // Deberíamos pedirselo a la api
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.apellido}</td>
                <td>{p.telefono}</td>
                <td>{p.mail}</td>
                <td>{p.depto}</td>
                <td>${p.saldo}</td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}> {/* Added container div with spacing */}
                    <button className="edit-btn" onClick={() => handleEdit(p)}>Editar</button>
                    <button className="delete-btn" onClick={() => handleDelete(p.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="add-btn" onClick={() => setShowModal(true)}>Añadir propietario</button>
      </div>

      {showModal && (
        <Modal
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingPropietario(null); }}
          initialData={editingPropietario}
        />
      )}
    </main>
  );
}

export default Propietarios;
