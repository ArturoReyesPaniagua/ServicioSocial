import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <header className='header__container'>
      <h1>header</h1>
    </header>
    <App />
  </StrictMode>,
)
