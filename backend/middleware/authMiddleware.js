const { auth } = require('../config/firebaseAdmin');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided, unauthorized.' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken; // contains uid, email, etc.
    next();
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { verifyToken };
