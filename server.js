import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import Usuario from '../models/Usuario';
import Proyecto from '../models/Proyecto';
import Tesina from '../models/Tesina';
import Mobiliario from '../models/Mobiliario';

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB conectado'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findOne({ _id: decoded._id });

    if (!usuario) {
      throw new Error();
    }

    req.token = token;
    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Por favor autentícate.' });
  }
};

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const usuario = await Usuario.findOne({ username });
    if (!usuario || usuario.password !== password) {
      return res.status(401).send({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET);
    res.send({ usuario, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post('/api/proyectos', auth, async (req, res) => {
  try {
    const proyecto = new Proyecto(req.body);
    await proyecto.save();
    res.status(201).send(proyecto);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/api/proyectos', auth, async (req, res) => {
  try {
    const proyectos = await Proyecto.find({});
    res.send(proyectos);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/api/proyectos/:id', auth, async (req, res) => {
  try {
    const proyecto = await Proyecto.findByIdAndDelete(req.params.id);
    if (!proyecto) {
      return res.status(404).send();
    }
    res.send(proyecto);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/api/tesinas', auth, async (req, res) => {
  try {
    const tesina = new Tesina(req.body);
    await tesina.save();
    res.status(201).send(tesina);
  } catch (error) {
    console.error('Error al guardar tesina:', error);
    res.status(400).send(error);
  }
});

app.get('/api/tesinas', auth, async (req, res) => {
  try {
    const tesinas = await Tesina.find({});
    res.send(tesinas);
  } catch (error) {
    console.error('Error al obtener tesinas:', error);
    res.status(500).send(error);
  }
});

app.delete('/api/tesinas/:id', auth, async (req, res) => {
  try {
    const tesina = await Tesina.findByIdAndDelete(req.params.id);
    if (!tesina) {
      return res.status(404).send();
    }
    res.send(tesina);
  } catch (error) {
    console.error('Error al eliminar tesina:', error);
    res.status(500).send(error);
  }
});

app.post('/api/mobiliario', auth, async (req, res) => {
  try {
    const mobiliario = new Mobiliario(req.body);
    await mobiliario.save();
    res.status(201).send(mobiliario);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/api/mobiliario', auth, async (req, res) => {
  try {
    const mobiliarios = await Mobiliario.find({});
    res.send(mobiliarios);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/api/mobiliario/:tipo', auth, async (req, res) => {
  try {
    const { tipo } = req.params;
    const { cantidad } = req.body;
    const mobiliario = await Mobiliario.findOneAndUpdate(
      { tipo },
      { $inc: { cantidad } },
      { new: true, runValidators: true }
    );
    if (!mobiliario) {
      return res.status(404).send();
    }
    res.send(mobiliario);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

export default app;

