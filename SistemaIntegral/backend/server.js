const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const connectDB = require("./db/db");
const authRoutes = require("./routes/authRoutes");

const port = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", authRoutes);

connectDB();

app.listen(port, () => {
  console.log(`El servidor corre en el puerto ${port}`);
});

