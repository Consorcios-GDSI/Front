import { FaUserCircle, FaHome } from "react-icons/fa";

function Header() {
  return (
    <header className="header">
      <h1>Consorcios</h1>

      {/* Menú horizontal */}
      <nav className="header-menu">
        <a href="/" className="menu-item">
          <FaHome size={18} /> Home
        </a>
        <a href="/edificios" className="menu-item">Gestión de Edificios</a> {/* <-- Nuevo Enlace */}
        <a href="/propietarios" className="menu-item">Gestión de Propietarios</a>
        <a href="/gastos" className="menu-item">Gastos</a>
        <a href="/expensas" className="menu-item">Expensas</a>
        <a href="/pagos" className="menu-item">Pagos</a>
        <a href="/reportes" className="menu-item">Reportes</a>
      </nav>

      <div className="user-info">
        <span>Franco</span>
        <FaUserCircle size={28} />
      </div>
    </header>
  );
}

export default Header;