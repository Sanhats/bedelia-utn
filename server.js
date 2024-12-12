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
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                 req.query.token || 
                 req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({ error: 'Por favor, autentícate.' });
  }
};

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

// Ruta de login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Intento de login:', { username }); // Log para debugging

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ username: ADMIN_USERNAME }, process.env.JWT_SECRET, {
        expiresIn: '24h' // El token expira en 24 horas
      });
      res.json({ 
        success: true,
        user: { username: ADMIN_USERNAME }, 
        token 
      });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (error) {
    console.error('Error en /api/login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para verificar la autenticación
app.get('/api/check-auth', auth, (req, res) => {
  res.json({ 
    success: true,
    message: 'Token válido', 
    user: req.user 
  });
});

// Ruta de logout
app.post('/logout', auth, (req, res) => {
  // En una implementación real, aquí podrías invalidar el token en el servidor
  res.json({ message: 'Logout successful' });
});

// Rutas protegidas para archivos HTML
app.get('/Inicio.html', (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || 
                req.query.token || 
                req.cookies?.token;

  if (!token) {
    return res.redirect('/login.html');
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.redirect('/login.html');
  }
}, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'Inicio.html'));
});

app.get('/proyectos.html', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'proyectos.html'));
});

app.get('/tesinas.html', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tesinas.html'));
});

app.get('/mobiliario.html', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'mobiliario.html'));
});

// Rutas de API protegidas
app.post('/proyectos', auth, async (req, res) => {
  try {
    const proyecto = new Proyecto(req.body);
    await proyecto.save();
    res.status(201).json(proyecto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/proyectos', auth, async (req, res) => {
  try {
    const proyectos = await Proyecto.find({});
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/proyectos/:id', auth, async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndDelete(req.params.id);
    if (!proyecto) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tesinas', auth, async (req, res) => {
  try {
    const tesina = new Tesina(req.body);
    await tesina.save();
    res.status(201).json(tesina);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/tesinas', auth, async (req, res) => {
  try {
    const tesinas = await Tesina.find({});
    res.json(tesinas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/tesinas/:id', auth, async (req, res) => {
  try {
    const tesina = await Tesina.findByIdAndDelete(req.params.id);
    if (!tesina) {
      return res.status(404).json({ error: 'Tesina no encontrada' });
    }
    res.json(tesina);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/mobiliario', auth, async (req, res) => {
  try {
    const mobiliario = new Mobiliario(req.body);
    await mobiliario.save();
    res.status(201).json(mobiliario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/mobiliario', auth, async (req, res) => {
  try {
    const mobiliarios = await Mobiliario.find({});
    res.json(mobiliarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/mobiliario/:tipo', auth, async (req, res) => {
  try {
    const { tipo } = req.params;
    const { cantidad } = req.body;
    const mobiliario = await Mobiliario.findOneAndUpdate(
      { tipo },
      { $inc: { cantidad } },
      { new: true, runValidators: true }
    );
    if (!mobiliario) {
      return res.status(404).json({ error: 'Mobiliario no encontrado' });
    }
    res.json(mobiliario);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta por defecto
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

