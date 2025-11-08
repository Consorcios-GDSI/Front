import { FaHome } from "react-icons/fa";
import { useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();
  
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
      <a href="/" style={{ position: "absolute", left: 16, margin: 0, textDecoration: "none", color: "inherit" }}>
        <h1 style={{ margin: 0, cursor: "pointer" }}>Consorcios</h1>
      </a>

      {/* Menú horizontal */}
      <nav
        className="header-menu"
        style={{
          display: "flex",
          gap: "24px", // aumentado para más separación
          justifyContent: "center",
          width: "100%",
          maxWidth: 1000,
          padding: "8px 24px",
          boxSizing: "border-box",
        }}
      >
        <a 
          href="/" 
          className="menu-item" 
          style={{ 
            padding: "6px 10px",
            fontWeight: location.pathname === "/" ? "bold" : "normal",
            pointerEvents: location.pathname === "/" ? "none" : "auto",
            opacity: location.pathname === "/" ? 0.7 : 1,
          }}
        >
          <FaHome size={18} /> Home
        </a>
        <a 
          href="/edificios" 
          className="menu-item" 
          style={{ 
            padding: "6px 10px",
            fontWeight: location.pathname === "/edificios" ? "bold" : "normal",
            pointerEvents: location.pathname === "/edificios" ? "none" : "auto",
            opacity: location.pathname === "/edificios" ? 0.7 : 1,
          }}
        >
          Gestión de Edificios
        </a>
        <a 
          href="/propietarios" 
          className="menu-item" 
          style={{ 
            padding: "6px 10px",
            fontWeight: location.pathname === "/propietarios" ? "bold" : "normal",
            pointerEvents: location.pathname === "/propietarios" ? "none" : "auto",
            opacity: location.pathname === "/propietarios" ? 0.7 : 1,
          }}
        >
          Gestión de Propietarios
        </a>
        <a 
          href="/gastos" 
          className="menu-item" 
          style={{ 
            padding: "6px 10px",
            fontWeight: location.pathname === "/gastos" ? "bold" : "normal",
            pointerEvents: location.pathname === "/gastos" ? "none" : "auto",
            opacity: location.pathname === "/gastos" ? 0.7 : 1,
          }}
        >
          Gastos
        </a>
        <a 
          href="/pagos" 
          className="menu-item" 
          style={{ 
            padding: "6px 10px",
            fontWeight: location.pathname === "/pagos" ? "bold" : "normal",
            pointerEvents: location.pathname === "/pagos" ? "none" : "auto",
            opacity: location.pathname === "/pagos" ? 0.7 : 1,
          }}
        >
          Pagos
        </a>
        <a 
          href="/expensas" 
          className="menu-item" 
          style={{ 
            padding: "6px 10px",
            fontWeight: location.pathname === "/expensas" ? "bold" : "normal",
            pointerEvents: location.pathname === "/expensas" ? "none" : "auto",
            opacity: location.pathname === "/expensas" ? 0.7 : 1,
          }}
        >
          Expensas
        </a>
      </nav>
    </header>
  );
}

export default Header;