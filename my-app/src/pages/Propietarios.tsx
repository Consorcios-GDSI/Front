import { useState } from "react";
import Modal from "../components/Modal";

// Definimos el tipo de un propietario
interface Propietario {
  nombre: string;
  apellido: string;
  telefono: string;
  mail: string;
  depto: string;
  saldo: number | string;
}

// Estado incluye un id adicional
type PropietarioConId = Propietario & { id: number };

function Propietarios() {
  const [propietarios, setPropietarios] = useState<PropietarioConId[]>([
    { id: 1, nombre: "Juan", apellido: "Pérez", telefono: "123456789", mail: "juan@mail.com", depto: "101", saldo: 5000 },
    { id: 2, nombre: "María", apellido: "Gómez", telefono: "987654321", mail: "maria@mail.com", depto: "102", saldo: 3000 },
  ]);
  const [showModal, setShowModal] = useState(false);

  // Tipamos el parámetro 'nuevo'
  const addPropietario = (nuevo: Propietario) => {
    setPropietarios([...propietarios, { id: Date.now(), ...nuevo }]);
    setShowModal(false);
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
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.apellido}</td>
                <td>{p.telefono}</td>
                <td>{p.mail}</td>
                <td>{p.depto}</td>
                <td>${p.saldo}</td>
                <td><button className="edit-btn">Editar</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="add-btn" onClick={() => setShowModal(true)}>Añadir propietario</button>
      </div>

      {showModal && <Modal onSave={addPropietario} onClose={() => setShowModal(false)} />}
    </main>
  );
}

export default Propietarios;
