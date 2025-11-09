import { FaHome } from "react-icons/fa";
import { NavLink } from "react-router-dom";

function Header() {
  return (
    <header
      className="header"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 0",
        width: "100%",
      }}
    >
      <NavLink to="/" style={{ position: "absolute", left: 16, margin: 0, textDecoration: "none", color: "inherit" }}>
        <h1 style={{ margin: 0, cursor: "pointer" }}>Consorcios</h1>
      </NavLink>

      {/* Menú horizontal */}
      <nav
        className="header-menu"
        style={{
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          width: "100%",
          maxWidth: 1000,
          padding: "8px 24px",
          boxSizing: "border-box",
        }}
      >
        <NavLink 
          to="/" 
          className="menu-item"
          style={({ isActive }) => ({ 
            padding: "6px 10px",
            fontWeight: isActive ? "bold" : "normal",
            pointerEvents: isActive ? "none" : "auto",
            opacity: isActive ? 0.7 : 1,
          })}
        >
          <FaHome size={18} /> Home
        </NavLink>
        <NavLink 
          to="/edificios" 
          className="menu-item"
          style={({ isActive }) => ({ 
            padding: "6px 10px",
            fontWeight: isActive ? "bold" : "normal",
            pointerEvents: isActive ? "none" : "auto",
            opacity: isActive ? 0.7 : 1,
          })}
        >
          Gestión de Edificios
        </NavLink>
        <NavLink 
          to="/propietarios" 
          className="menu-item"
          style={({ isActive }) => ({ 
            padding: "6px 10px",
            fontWeight: isActive ? "bold" : "normal",
            pointerEvents: isActive ? "none" : "auto",
            opacity: isActive ? 0.7 : 1,
          })}
        >
          Gestión de Propietarios
        </NavLink>
        <NavLink 
          to="/gastos" 
          className="menu-item"
          style={({ isActive }) => ({ 
            padding: "6px 10px",
            fontWeight: isActive ? "bold" : "normal",
            pointerEvents: isActive ? "none" : "auto",
            opacity: isActive ? 0.7 : 1,
          })}
        >
          Gastos
        </NavLink>
        <NavLink 
          to="/pagos" 
          className="menu-item"
          style={({ isActive }) => ({ 
            padding: "6px 10px",
            fontWeight: isActive ? "bold" : "normal",
            pointerEvents: isActive ? "none" : "auto",
            opacity: isActive ? 0.7 : 1,
          })}
        >
          Pagos
        </NavLink>
        <NavLink 
          to="/expensas" 
          className="menu-item"
          style={({ isActive }) => ({ 
            padding: "6px 10px",
            fontWeight: isActive ? "bold" : "normal",
            pointerEvents: isActive ? "none" : "auto",
            opacity: isActive ? 0.7 : 1,
          })}
        >
          Expensas
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;