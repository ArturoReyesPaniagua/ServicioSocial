import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Inicio from './components/Principal/Inicio';
import Interno from './components/Interno/interno';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/login" element={<Inicio />} /> 
        <Route path="/interno" element={<Interno />} />
        {/* Otras rutas */}
      </Routes>
    </Router>
  );
}

export default App;