// File authRoutes.js
// SistemaIntegral/backend/routes/authRoutes.js 
// Este archivo contiene las rutas de autenticación y gestión de usuarios
// que interactúan con los controladores y manejan las solicitudes HTTP relacionadas con los usuarios

const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");

// Rutas de autenticación
router.post("/register", authControllers.register);
router.post("/login", authControllers.login);

// Rutas de gestión de usuarios
router.get("/users", authControllers.getAllUsers);
router.get("/users/:id", authControllers.getUserById);
router.put("/users/:id", authControllers.updateUser);
router.delete("/users/:id", authControllers.deleteUser);

module.exports = router;