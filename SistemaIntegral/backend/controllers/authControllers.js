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
  const { username, password, role = 'user' } = req.body; // se asigna automaticamente user  si el usuario no proporciona un rol
 
  if (!username || !password) { // Validar que los campos no estén vacíos
    res
      .status(400)
      .json({ error: "Los campos de usuario y contraseña no pueden estar vacios!" });
    return;
  }
  const salt = await bcrypt.genSalt(10); // Generar un salt para el hash de la contraseña
  const hashedPassword = await bcrypt.hash(password, salt);// Hashear la contraseña
  const user = { // Crear un nuevo objeto de usuario unico con un id unico encryptado
    userId: uuidv4(),
    username,
    password: hashedPassword, // Guardar la contraseña hasheada
    role
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
  if (!username || !password) { // Validar que los campos no estén vacíos
    res
      .status(400)
      .json({ error: "Los campos no pueden estar vacios!" }); // Devolver el error 400 si los compos estan vaciso
    return;
  }

  try {
    const existingUser = await checkRecordExists("users", "username", username); // Verificar si el usuario existe en la base de datos
    

    if (existingUser) { // si el usuario existe verificar la contraseña
      if (!existingUser.password) {
        res.status(401).json({ error: "Invalid credentials" }); // Devolver el error 401 si la contraseña no es válida
        return;
      }

      const passwordMatch = await bcrypt.compare( // Comparar la contraseña proporcionada con la contraseña hasheada almacenada en la base de datos
        password,
        existingUser.password
      );

      if (passwordMatch) { // Si la contraseña coincide, devolver el token de acceso y los datos del usuario
        res.status(200).json({ // GENERAR TOKEN DE ACCESO  -- JWT
          userId: existingUser.userId,
          username: existingUser.username,
          role: existingUser.role,
          access_token: generateAccessToken(existingUser.userId),
        });
      } else {
        res.status(401).json({ error: "Contraseña incorrecta" }); // Devolver el error 401 si la ccontraseña no coincide
      }
    } else {
      res.status(401).json({ error: "Nombre de usuario no registrado" }); // Devolver el error 401 si el nombre de usuario no esta registrado
    }
  } catch (error) {
    res.status(500).json({ error: error.message }); // Devolver un error 500 si ocurre un problema al iniciar sesión
  }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => { // Obtener todos los usuarios de la base de datos
  // Se requiere autenticación y rol de administrador para acceder a esta ruta
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT userId, username, role FROM users' // Query para obtener todos los usuarios
    );
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => { // Obtener un usuario por su ID
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT userId, username, role FROM users WHERE userId = ?',
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

// Actualizar un usuario
const updateUser = async (req, res) => { // Actualizar un usuario existente en la base de datos
  let connection;
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;
    connection = await getConnection();

    // Verificar que el usuario existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM users WHERE userId = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Si se proporciona una contraseña, hay que hashearla
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Actualizar usuario con nueva contraseña
      await connection.execute(
        'UPDATE users SET username = ?, password = ?, role = ? WHERE userId = ?',
        [username, hashedPassword, role, id]
      );
    } else {
      // Actualizar usuario sin cambiar la contraseña
      await connection.execute(
        'UPDATE users SET username = ?, role = ? WHERE userId = ?',
        [username, role, id]
      );
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente' }); // Mensaje de confirmaccion de que el usuario fue actualizado correctamente
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await getConnection();

    // Verificar que el usuario existe
    const [checkRows] = await connection.execute(
      'SELECT * FROM users WHERE userId = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Eliminar el usuario
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
// Exportar las  funciones para su uso en otras partes de Backend
module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};