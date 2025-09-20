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




/*
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Ajoneuvon kustannusseuranta</h1>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </div>
      <div className={`nav-links ${isOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setIsOpen(false)}>Etusivu</Link>
        <Link to="/cars" onClick={() => setIsOpen(false)}>Ajoneuvot</Link>
        <Link to="/fuel" onClick={() => setIsOpen(false)}>Tankkaukset</Link>
        <Link to="/services" onClick={() => setIsOpen(false)}>Huollot</Link>
        <Link to="/charts" onClick={() => setIsOpen(false)}>Kaaviot</Link>
      </div>
    </nav>
  );
}
*/

/*
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';
import { Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material'; // Example using Material-UI icons

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">Your App</div>
      <div className="hamburger" onClick={toggleMenu}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </div>
      <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
        <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
        <li><Link to="/cars" onClick={() => setIsOpen(false)}>Cars</Link></li>
        <li><Link to="/services" onClick={() => setIsOpen(false)}>Services</Link></li>
        <li><Link to="/fuel" onClick={() => setIsOpen(false)}>Fuel</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
*/

/*
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <h1>Ajoneuvon kustannusseuranta</h1>
      <div className="links">
        <Link to="/">Etusivu</Link>
        <Link to="/cars">Ajoneuvot</Link>
        <Link to="/fuel">Tankkaukset</Link>
        <Link to="/services">Huollot</Link>
        <Link to="/charts">Kaaviot</Link>
      </div>
    </nav>
  )
}
*/
