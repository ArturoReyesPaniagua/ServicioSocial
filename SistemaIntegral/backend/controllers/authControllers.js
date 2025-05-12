// File: authControllers.js
// Controlador de autenticación y gestión de usuarios
// Este controlador maneja el registro, inicio de sesión y gestión de usuarios en la base de datos

const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userSchema");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const config = require("../db/config");
const {
  createTable,
  checkRecordExists,
  insertRecord,
} = require("../utils/funtiosauth");

// obtener conexión a la base de datos
const getConnection = async () => {
  return await mysql.createConnection(config);
};

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" }); // Token válido por 7 días
};

const register = async (req, res) => {
  const { username, password, role = 'user', id_area  } = req.body; // se asigna automaticamente user  si el usuario no proporciona un rol
 
  if (!username || !password) { // Validar que los campos no estén vacíos
    res
      .status(400)
      .json({ error: "Los campos de usuario y contraseña no pueden estar vacios!" });
    return;
  }
  //const salt = await bcrypt.genSalt(10); // Generar un salt para el hash de la contraseña
  //const hashedPassword = await bcrypt.hash(password, salt);// Hashear la contraseña
  const user = { // Crear un nuevo objeto de usuario unico con un id unico encryptado
    userId,
    username,
    password,//: hashedPassword, // Guardar la contraseña hasheada
    role,
    id_area // Inicializar id_area 
  };
  try {
    await createTable(userSchema); // Asegurarse de que la tabla existe
    const userAlreadyExists = await checkRecordExists("users", "username", username); // Verificar si el usuario ya existe en la base de datos
    if (userAlreadyExists) {  // Si el usuario ya existe, devolver un error 409
      res.status(409).json({ error: "El nombre de usuario ya esta registrado" });
    } else { // Si el usuario no existe, insertar el nuevo usuario en la base de datos
      await insertRecord("users", user);
      res.status(201).json({ message: "Usuario creado con exito!" });// Devolver un mensaje de éxito
    }
  } catch (error) {
    res.status(500).json({ error: error.message }); //  Devolver un error 500 si ocurre un problema al crear el usuario
  }
};

const login = async (req, res) => { // Iniciar sesión
  const { username, password } = req.body; // Obtener el nombre de usuario y la contraseña del cuerpo de la solicitud
  
  console.log("Intento de login:", { username, password});
  
  if (!username || !password) { // Validar que los campos no estén vacíos
    res
      .status(400)
      .json({ error: "Los campos no pueden estar vacios!" }); // Devolver el error 400 si los compos estan vaciso
    return;
  }

  try {
    const existingUser = await checkRecordExists("users", "username", username); // Verificar si el usuario existe en la base de datos
    
    console.log("Usuario encontrado:", existingUser ? "Sí" : "No");

    if (existingUser) { // si el usuario existe verificar la contraseña
      if (!existingUser.password) {
        res.status(401).json({ error: "Invalid credentials" }); // Devolver el error 401 si la contraseña no es válida
        return;
      }

      async function compare(password, hashedPassword) { // Función para comparar la contraseña proporcionada con la contraseña hasheada
        password === hashedPassword; // Comparar las contraseñas
        return password === hashedPassword; // Devolver verdadero si las contraseñas coinciden, falso de lo contrario
      }

      const passwordMatch = await compare( // Comparar la contraseña proporcionada con la contraseña hasheada almacenada en la base de datos
        password,
        existingUser.password
      );
      console.log("Contraseña proporcionada:", password);
      console.log("Contraseña almacenada:", existingUser.password);
      console.log("Contraseña coincide:", passwordMatch ? "Sí" : "No");

      if (passwordMatch) { // Si la contraseña coincide, devolver el token de acceso y los datos del usuario
        const token = generateAccessToken(existingUser.userId);
        const response = {
          userId: existingUser.userId,
          username: existingUser.username,
          role: existingUser.role,
          access_token: token,
        };
        
        console.log("Respuesta de login:", { ...response, access_token: "******" });
        
        res.status(200).json(response);
      } else {
        res.status(401).json({ error: "Contraseña incorrecta" }); // Devolver el error 401 si la ccontraseña no coincide
      }
    } else {
      res.status(401).json({ error: "Nombre de usuario no registrado" }); // Devolver el error 401 si el nombre de usuario no esta registrado
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: error.message }); // Devolver un error 500 si ocurre un problema al iniciar sesión
  }
};


const getAllUsers = async (req, res) => { 
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT userId, username, role FROM users'
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

const getUserById = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT userId, username, role, id_area FROM users WHERE userId = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

const updateUser = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { username, password, role, id_area } = req.body;
    connection = await getConnection();

    const [checkRows] = await connection.execute(
      'SELECT * FROM users WHERE userId = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (password) {
      //const salt = await bcrypt.genSalt(10);
      //const hashedPassword = await bcrypt.hash(password, salt);
      
      await connection.execute(
        'UPDATE users SET username = ?, password = ?, role = ?, id_area= ? WHERE userId = ?',
        [username, hashedPassword, role, id]
      );
    } else {
      await connection.execute(
        'UPDATE users SET username = ?, role = ?, id_area= ? WHERE userId = ?',
        [username, role, id, id_area]
      );
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

const deleteUser = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();

    const [checkRows] = await connection.execute(
      'SELECT * FROM users WHERE userId = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await connection.execute(
      'DELETE FROM users WHERE userId = ?',
      [id]
    );

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};