import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
//import './index.css'
import App from './App.jsx'
import Logo from './assets/logo_sec_educ.png'
import RegisterForm from './components/Registration/Registration.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
            <header className='header__principal'>
                <div className='header__img'>
                <img src={Logo}  className='header__logo'/> {/*Logo de la secretaria*/}
                </div>
                
                <div className="header__text" >
                  <p>
                      <i>Subsecretaria de Educación Básica <br/>
                      <strong>Unidad de Planeación, evaluación y control escolar</strong> <br/>
                      Departamento de información y sistemas</i>  
                  </p>
                </div>

            </header>
    <App />
    {//<RegisterForm/>
    }
  </StrictMode>,
)
