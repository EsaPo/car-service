// Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material'; // Ensure you have Material-UI installed (@mui/material @mui/icons-material) or choose another icon library

export default function Navbar() {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <nav className="navbar">
      <h1>Ajoneuvon Tietojen Hallinta</h1>
      <button className="hamburger-menu" onClick={toggleMenu}>
        ☰
      </button>
      <div className={`links ${showMenu ? 'show' : ''}`}>
        <Link to="/">Etusivu</Link>
        <Link to="/cars">Ajoneuvot</Link>
        <Link to="/fuel">Tankkaukset</Link>
	<Link to="/drivingdata">Ajopäiväkirja</Link>
        <Link to="/services">Huollot</Link>
        <Link to="/charts">Kaaviot</Link>
      </div>
    </nav>
  );
}
