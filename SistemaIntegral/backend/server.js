const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");

const connectDB = require("./db/db"); //ajustes de la config de la base de datos
const port = 3001; // definir puerto

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", authRoutes);

connectDB();

app.listen(port, () => {
  console.log(`El servidor corre en el puerto ${port}`);
});

