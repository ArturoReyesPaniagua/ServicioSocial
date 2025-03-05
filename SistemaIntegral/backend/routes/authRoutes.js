const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers"); //importar el controlador de autenticacion


router.post("/register", authControllers.register);
router.post("/login", authControllers.login);

module.exports = router;