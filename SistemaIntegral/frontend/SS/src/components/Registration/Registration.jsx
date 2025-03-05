import React, { useState } from 'react';

function registerForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error registering user:", error);
    }
    return (
        <div className="form">
            <form onSubmit={handleSubmit}>
               <h1>Registrar Usuario</h1>
               <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
               <input type="text" placeholder="Password"value={password} onChange={(e) => setPassword(e.target.value)}/> <br />
               <button> Register</button>
            </form>
        </div>
      );
    }
    
  };


export default registerForm;