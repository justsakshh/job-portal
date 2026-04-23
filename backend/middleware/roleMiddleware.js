const { db } = require('../config/firebaseAdmin');

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { uid } = req.user;
      
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User profile not found in database.' });
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions for this role.' });
      }

      req.dbUser = userData;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ message: 'Internal server error during role check.' });
    }
  };
};

module.exports = { checkRole };
