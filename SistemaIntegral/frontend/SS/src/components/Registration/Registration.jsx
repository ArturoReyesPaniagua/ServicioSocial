import React, { useState } from 'react';
import axios from 'axios';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', {
        username,
        password,
        role,
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error registrando user:", error);
    }
  };

  return (
    <div className="form">
      <form onSubmit={handleSubmit}>
        <h1>Registrar Usuario</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br/>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br/>
        <select
          name="options"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">usuario</option>
          <option value="admin">administrador</option>
        </select>
        <br/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterForm;