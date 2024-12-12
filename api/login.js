import jwt from 'jsonwebtoken';

const ADMIN_USERNAME = 'Bedelia';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Bedelia123';

export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ username: ADMIN_USERNAME }, process.env.JWT_SECRET);
        res.status(200).json({ user: { username: ADMIN_USERNAME }, token });
      } else {
        res.status(401).json({ error: 'Credenciales inválidas' });
      }
    } catch (error) {
      console.error('Error en /api/login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

