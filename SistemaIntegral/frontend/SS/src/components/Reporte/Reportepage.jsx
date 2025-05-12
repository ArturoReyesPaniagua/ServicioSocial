//File: reportepage.jsx
// SistemaIntegral/frontend/SS/src/components/Reporte/Reportepage.jsx
// Este componente es la página principal para la creacion de reportes de los oficios 


import react from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';


function reportepage() {
    


return (
    <div className="contenedor">
        <div>   
            <h1>Reportes</h1>
        </div>
        <div className="contenedor__reportes">

            <button className="btn btn-primary"> Generar Reporte </button> 

 
        </div>
 
            

    </div>
    )
}

export default reportepage;