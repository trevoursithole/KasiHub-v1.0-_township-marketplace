const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kasihub-fallback-secret-set-JWT_SECRET-env-var';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
