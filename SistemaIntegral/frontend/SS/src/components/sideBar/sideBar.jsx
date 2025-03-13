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
        {isOpen ? 'Cerrar' : 'Abrir'} Menu
      </button>
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <h2>Menú</h2>
 
          <button>Expedientes</button>
          <button>registrar</button>
     
      </div>
    </>
  );
};

export default SideBar;