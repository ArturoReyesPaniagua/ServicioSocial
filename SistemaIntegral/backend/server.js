const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db/db');
const expedientesRoutes = require('./routes/expedientesRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001; // cambiar para que lo lea del .env completamente y no sea leido aqui mismo

// Middleware para habilitar CORS y parsear JSON
// Habilitar CORS para permitir solicitudes de diferentes dominios
app.use(cors());
app.use(express.json());

// Para poder manejar datos de formulario codificados en la URL
// si es necesario puedes investigar si es necesario usarlo o no
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración para archivos de gran tamaño 
// aumentar el límite de tamaño de los archivos que se pueden enviar (actualmente son 50mb pero recomiendo cambiarlo al tamaño que necesites)
// Esto es útil para manejar archivos grandes como PDFs o imágenes
// De hecho la razon por la que no funcionaba la primera vez es porque el tamaño de los archivos era muy grande y no se permitia
app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));

// Conectar a la base de datos
connectDB();

// Rutas
app.use('/api', expedientesRoutes);
app.use('/api', pdfRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Gestión de Oficios funcionando');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});