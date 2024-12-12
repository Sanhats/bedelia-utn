import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.status(200).json({ message: 'Token válido', user: decoded });
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

