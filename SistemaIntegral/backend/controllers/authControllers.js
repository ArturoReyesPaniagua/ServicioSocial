// SistemaIntegral/backend/controllers/authControllers.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const userSchema = require("../schemas/userSchema");
const { connectDB } = require("../db/db");

// Generar token de acceso
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Registrar nuevo usuario
const register = async (req, res) => {
  try {
    const { username, password, role = 'user', id_area } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: "Los campos de usuario y contraseña no pueden estar vacios!" 
      });
    }

    if (!id_area) {
      return res.status(400).json({ 
        error: "El área es obligatoria!" 
      });
    }

    const pool = await connectDB();
    
    // Asegurar que la tabla existe
    await pool.request().query(userSchema);
    
    // Verificar si el usuario ya existe
    const userCheck = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM users WHERE username = @username');
    
    if (userCheck.recordset.length > 0) {
      return res.status(409).json({ error: "El nombre de usuario ya esta registrado" });
    }
    
    // Verificar que el área existe
    const areaCheck = await pool.request()
      .input('id_area', sql.Int, id_area)
      .query('SELECT * FROM Area WHERE id_area = @id_area');
      
    if (areaCheck.recordset.length === 0) {
      return res.status(404).json({ error: "El área seleccionada no existe" });
    }
    
    // Crear hash de la contraseña (desactivado en el código original, pero incluido aquí para seguridad)
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    
    // Insertar el nuevo usuario
    const insertQuery = `
      INSERT INTO users (username, password, role, id_area) 
      VALUES (@username, @password, @role, @id_area);
      SELECT SCOPE_IDENTITY() AS userId;
    `;
    
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password) // Usar hashedPassword para mayor seguridad
      .input('role', sql.NVarChar, role)
      .input('id_area', sql.Int, id_area)
      .query(insertQuery);
    
    res.status(201).json({ 
      message: "Usuario creado con exito!",
      userId: result.recordset[0].userId
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: error.message });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log("Intento de login:", { username, password: '********'});
    
    if (!username || !password) {
      return res.status(400).json({ error: "Los campos no pueden estar vacios!" });
    }
    
    const pool = await connectDB();
    
    // Buscar el usuario y obtener también la información del área
    const userResult = await pool.request()
      .input('username', sql.NVarChar, username)
      .query(`
        SELECT u.*, a.nombre_area 
        FROM users u
        LEFT JOIN Area a ON u.id_area = a.id_area
        WHERE u.username = @username
      `);
      
    console.log("Resultado de búsqueda de usuario:", userResult.recordset);
    
    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: "Nombre de usuario no registrado" });
    }
    
    const user = userResult.recordset[0];
    console.log("Usuario encontrado:", user.username, user.password);
    
    if (!user.password) {
      return res.status(401).json({ error: "Información inválida" });
    }
    
    // Verificar la contraseña
    const passwordMatch = await password === user.password;
    console.log("Contraseña proporcionada", password);
    console.log("Contraseña almacenada", user.password);
    // const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("Contraseña coincide:", passwordMatch ? "Sí" : "No");
    
    if (passwordMatch) {
      const token = generateAccessToken(user.userId);
      
      // Incluir información adicional del usuario en la respuesta
      const response = {
        userId: user.userId,
        username: user.username,
        role: user.role,
        id_area: user.id_area,
        nombre_area: user.nombre_area,
        access_token: token,
      };
      
      console.log("Respuesta de login:", { ...response, access_token: "******" });
      res.status(200).json(response);
    } else {
      res.status(401).json({ error: "Contraseña incorrecta" });
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const pool = await connectDB();
    
    // Incluir información del área en la consulta
    const result = await pool.request()
      .query(`
        SELECT u.userId, u.username, u.role, u.id_area, a.nombre_area 
        FROM users u
        LEFT JOIN Area a ON u.id_area = a.id_area
      `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    
    // Incluir información del área en la consulta
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT u.userId, u.username, u.role, u.id_area, a.nombre_area 
        FROM users u
        LEFT JOIN Area a ON u.id_area = a.id_area
        WHERE u.userId = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, id_area } = req.body;
    const pool = await connectDB();

    // Verificar que el usuario existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM users WHERE userId = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el área existe si se proporciona
    if (id_area) {
      const areaCheck = await pool.request()
        .input('id_area', sql.Int, id_area)
        .query('SELECT * FROM Area WHERE id_area = @id_area');
        
      if (areaCheck.recordset.length === 0) {
        return res.status(404).json({ error: "El área seleccionada no existe" });
      }
    }

    // Si se proporciona contraseña, actualizar todos los campos
    if (password) {
      // Actualizar con nueva contraseña
      // const salt = await bcrypt.genSalt(10);
      // const hashedPassword = await bcrypt.hash(password, salt);
      
      await pool.request()
        .input('username', sql.NVarChar, username)
        .input('password', sql.NVarChar, password)
        .input('role', sql.NVarChar, role)
        .input('id_area', sql.Int, id_area || null)
        .input('id', sql.Int, id)
        .query(`
          UPDATE users 
          SET username = @username, 
              password = @password, 
              role = @role, 
              id_area = @id_area 
          WHERE userId = @id
        `);
    } else {
      // Actualizar sin cambiar la contraseña
      await pool.request()
        .input('username', sql.NVarChar, username)
        .input('role', sql.NVarChar, role)
        .input('id_area', sql.Int, id_area || null)
        .input('id', sql.Int, id)
        .query(`
          UPDATE users 
          SET username = @username, 
              role = @role, 
              id_area = @id_area 
          WHERE userId = @id
        `);
    }

    res.status(200).json({ message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();

    // Verificar que el usuario existe
    const checkResult = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM users WHERE userId = @id');

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Eliminar el usuario
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM users WHERE userId = @id');

    res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ error: error.message });
  }
};

// Verificar el token (puedes agregar este método adicional)
const verifyToken = async (req, res) => {
  try {
    // El middleware authenticateToken ya verificó el token
    // Solo necesitamos obtener la información del usuario
    const userId = req.user.userId;
    const pool = await connectDB();
    
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT u.userId, u.username, u.role, u.id_area, a.nombre_area 
        FROM users u
        LEFT JOIN Area a ON u.id_area = a.id_area
        WHERE u.userId = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = result.recordset[0];
    
    res.status(200).json({
      userId: user.userId,
      username: user.username,
      role: user.role,
      id_area: user.id_area,
      nombre_area: user.nombre_area
    });
  } catch (error) {
    console.error("Error al verificar token:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  verifyToken
};