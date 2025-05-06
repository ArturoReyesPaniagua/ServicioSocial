const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./db/db');
const oficioRoutes = require('./routes/oficioRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const authRoutes = require('./routes/authRoutes');
const areaRoutes = require('./routes/areaRoutes');
const responsableRoutes = require('./routes/responsableRoutes');
const solicitanteRoutes = require('./routes/solicitanteRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware para habilitar CORS y parsear JSON
app.use(cors());
app.use(express.json());

// Para poder manejar datos de formulario codificados en la URL
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración para archivos de gran tamaño
app.use(bodyParser.json({ limit: '150mb' }));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));

// Conectar a la base de datos
connectDB();

// Rutas
app.use('/api', oficioRoutes);
app.use('/api', pdfRoutes);
app.use('/api', areaRoutes);
app.use('/api', responsableRoutes);
app.use('/api', solicitanteRoutes);
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del Sistema Integral de Gestión de Oficios funcionando');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});