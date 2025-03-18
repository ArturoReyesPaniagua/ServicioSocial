const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const connectDB = require("./db/db");
const authRoutes = require("./routes/authRoutes");
//const estadoRoutes = require("./routes/estadoRoutes"); Se elimino la normalizacion de la base de datos que daba a estado, ya que son solo 3 y no son dinamicos.
const expedientesRoutes = require("./routes/expedientesRoutes");
const pdfRoutes = require("./routes/pdfRoutes");

const port = process.env.PORT || 3003;

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));  // Aumentar el límite para permitir archivos PDF
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use("/", authRoutes);
//app.use("/api", estadoRoutes);Se elimino estado como elemento aparte
app.use("/api", expedientesRoutes);
app.use("/api", pdfRoutes);

connectDB();

app.listen(port, () => {
  console.log(`El servidor corre en el puerto ${port}`);
});