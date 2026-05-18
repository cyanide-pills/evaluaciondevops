import { useState } from "react";
import { Modal } from "../CrudAdmin/Modal";
import { FormDespachoSimple } from "../CrudAdmin/FormDespachoSimple";

function Navbar() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <nav className="rounded-xl w-[250px] min-h-[880px] bg-teal-600 text-white sticky top-0 p-4 m-4">
        {/* Logo o título */}
        <h2 className="text-xl font-bold mb-8">Despacho Dashboard</h2>

        {/* Botón para crear nuevo despacho */}
        <button
          onClick={() => setOpenModal(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-3 rounded-lg mb-6 transition-all duration-300"
        >
          + Nuevo Despacho
        </button>

        {/* Menú de navegación */}
        <ul className="space-y-3">
          <li>
            <a
              href="#"
              className="block font-bold py-2 px-3 hover:bg-teal-700 rounded"
            >
              Usuarios
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block font-bold py-2 px-3 hover:bg-teal-700 rounded"
            >
              Productos
            </a>
          </li>
          <li>
            <a
              href="#"
              className="block font-bold py-2 px-3 hover:bg-teal-700 rounded"
            >
              Configuración
            </a>
          </li>
        </ul>
      </nav>

      {/* Modal para crear nuevo despacho */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <FormDespachoSimple onClose={() => setOpenModal(false)} />
      </Modal>
    </>
  );
}

export default Navbar;
