import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
//import Inicio from './components/Principal/Inicio';
//import Interno from './components/Interno/interno';
import Login from './components/Login/Login';
import RegisterForm from './components/Registration/Registration';
import MainLayout from './components/MainLayout/MainLayout';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} /> 
        <Route path="/login" element={<Login />} /> 
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/Layout" element={<MainLayout/> } />
        
      </Routes>
    </Router>
  );
}

export default App;