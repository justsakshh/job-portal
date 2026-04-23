const { db } = require('../config/firebaseAdmin');

const registerUser = async (req, res) => {
  try {
    const { uid, email, role } = req.body;

    if (!uid || !email || !role) {
      return res.status(400).json({ message: 'Missing required fields: uid, email, role' });
    }

    if (!['job_seeker', 'employer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role provided. Must be job_seeker or employer.' });
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(409).json({ message: 'User already exists in the database.' });
    }

    const userData = {
      uid,
      email,
      role,
      createdAt: new Date().toISOString(),
      profile: {}
    };

    await userRef.set(userData);

    return res.status(201).json({ message: 'User registered successfully in database', user: userData });
  } catch (error) {
    console.error('Registration controller error:', error);
    return res.status(500).json({ message: 'Failed to register user in database', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { uid } = req.user;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User profile not found in database. Please register.' });
    }

    return res.status(200).json({ message: 'Login verified', user: userDoc.data() });
  } catch (error) {
    console.error('Login controller error:', error);
    return res.status(500).json({ message: 'Failed to verify login', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const { uid } = req.user;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    return res.status(200).json({ user: userDoc.data() });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
