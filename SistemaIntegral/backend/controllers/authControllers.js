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

// Helper para obtener conexión a la base de datos
const getConnection = async () => {
  return await mysql.createConnection(config);
};

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const register = async (req, res) => {
  const { username, password, role = 'user' } = req.body; // se asigna automaticamente user 
  if (!username || !password) {
    res
      .status(400)
      .json({ error: "Los campos de usuario y contraseña no pueden estar vacios!" });
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = {
    userId: uuidv4(),
    username,
    password: hashedPassword,
    role
  };
  try {
    await createTable(userSchema);
    const userAlreadyExists = await checkRecordExists("users", "username", username);
    if (userAlreadyExists) {
      res.status(409).json({ error: "El nombre de usuario ya esta registrado" });
    } else {
      await insertRecord("users", user);
      res.status(201).json({ message: "Usuario creado con exito!" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res
      .status(400)
      .json({ error: "Los campos no pueden estar vacios!" });
    return;
  }

  try {
    const existingUser = await checkRecordExists("users", "username", username);

    if (existingUser) {
      if (!existingUser.password) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (passwordMatch) {
        res.status(200).json({
          userId: existingUser.userId,
          username: existingUser.username,
          role: existingUser.role,
          access_token: generateAccessToken(existingUser.userId),
        });
      } else {
        res.status(401).json({ error: "Contraseña incorrecta" });
      }
    } else {
      res.status(401).json({ error: "Nombre de usuario no registrado" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los usuarios
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

// Obtener un usuario por ID
const getUserById = async (req, res) => {
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
const updateUser = async (req, res) => {
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

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
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

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};