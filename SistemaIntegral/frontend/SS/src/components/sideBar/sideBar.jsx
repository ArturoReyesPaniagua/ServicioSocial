import React, { useState } from 'react';
import './sideBar.css';

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="toggle-button" onClick={toggleSidebar}>
        {isOpen ? 'Close' : 'Open'} Menu
      </button>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <h2>Menú</h2>
        <ul>
          <li><a href="#home">Inicio</a></li>
          <li><a href="#services">Servicios</a></li>
          <li><a href="#clients">Clientes</a></li>
          <li><a href="#contact">Contacto</a></li>
        </ul>
      </div>
    </>
  );
};

export default SideBar;