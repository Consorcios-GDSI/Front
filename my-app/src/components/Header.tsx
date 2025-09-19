import { FaUserCircle } from "react-icons/fa";

function Header() {
  return (
    <header className="header">
      <h1>Consorcios</h1>
      <div className="user-info">
        <span>Franco</span>
        <FaUserCircle size={32} />
      </div>
    </header>
  );
}

export default Header;
