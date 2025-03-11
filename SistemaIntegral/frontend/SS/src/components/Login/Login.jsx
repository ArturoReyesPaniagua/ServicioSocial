import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        username,
        password,
      });
      console.log(response.data);
      navigate('/interno'); // Cambia '/
    } catch (error) {
      console.error("Error al Iniciar sesión :", error);
    }
  };

  return (
    <div className="form">
      <form onSubmit={handleSubmit}>
        <h1>Iniciar sesión</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button className='buttonA' type="submit">Inicio de sesión</button>
      </form>
    </div>
  );
}

export default Login;


