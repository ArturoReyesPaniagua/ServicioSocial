
// SistemaIntegral/frontend/SS/src/components/Principal/Inicio.jsx
// Este componente es la página de inicio de sesión *** Se quedo vacia con el tiempo pero sigue siendo un contenedor para el login por lo que no se borra por el momento***

import Login from "../Login/Login";
//import './Inicio.css';

function Inicio() {


    return (
        <div className="contenedor">
            
            <Login/>
            {/* Renderiza el componente de inicio de sesion, porque no cuenta con algo como pagina login y no esta unida al componente de sidebar 
            es com la pagina inicia de la aplicacion.
            */}

        </div>
    )
}

export default Inicio;