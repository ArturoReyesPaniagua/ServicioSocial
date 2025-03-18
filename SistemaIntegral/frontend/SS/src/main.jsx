import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
//import Login from './components/Login/Login.jsx'
import Logo from './assets/logo_sec_educ.png'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <header className='header__principal'>
          <div className='header__img'>
            <img src={Logo} className='header__logo'/>
          </div>
          <div className="header__text">
            <p>
              <i>Subsecretaria de Educación Básica <br/>
              <strong>Unidad de Planeación, evaluación y control escolar</strong> <br/>
              Departamento de información y sistemas</i>  
            </p>
          </div>
        </header>
        <App/>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)