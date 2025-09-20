// Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css'; 

export default function Navbar() {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <nav className="navbar">
      <h1>Polttoaineen kulutus</h1>
      <button className="hamburger-menu" onClick={toggleMenu}>
        ☰
      </button>
      <div className={`links ${showMenu ? 'show' : ''}`}>
        <Link to="/">Etusivu</Link>
        <Link to="/fuel">Tankkaukset</Link>
        <Link to="/cars">Autot</Link>
        <Link to="/charts">Kaaviot</Link>
      </div>
    </nav>
  );
}


/*import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1>Polttoaineen kulutus</h1>
      <div className="links">
        <Link to="/">Etusivu</Link>
        <Link to="/fuel">Tankkaukset</Link>
        <Link to="/cars">Autot</Link>
        <Link to="/charts">Kaaviot</Link>
      </div>
    </nav>
  )
}
*/

