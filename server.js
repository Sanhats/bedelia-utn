const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Usuario = require('./models/Usuario');
const Proyecto = require('./models/Proyecto');
const Tesina = require('./models/Tesina');
const Mobiliario = require('./models/Mobiliario');

const app = express();
const PORT = process.env.PORT || 5000;

// Credenciales únicas
const ADMIN_USERNAME = 'Bedelia';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Bedelia123';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para verificar el token en rutas protegidas
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

// Ruta de login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ username: ADMIN_USERNAME }, process.env.JWT_SECRET);
      res.json({ user: { username: ADMIN_USERNAME }, token });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para verificar la autenticación
app.get('/check-auth', auth, (req, res) => {
  res.json({ message: 'Token válido', user: req.user });
});

// ... (el resto del código permanece igual)

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

