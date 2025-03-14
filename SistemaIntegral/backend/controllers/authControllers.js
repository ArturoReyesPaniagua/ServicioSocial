const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userSchema");
const bcrypt = require("bcryptjs");
const {
  createTable,
  checkRecordExists,
  insertRecord,
} = require("../utils/funtiosauth");

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const register = async (req, res) => {
  const { username, password, role = 'user' } = req.body; // se asigna automaticamente user 
  if (!username || !password) {
    res
      .status(400)
      .json({ error: "Los campos de usuario y contraseña no pueden estar vacias!" });
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

module.exports = {
  register,
  login,
};

