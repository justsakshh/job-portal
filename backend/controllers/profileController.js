const { db } = require('../config/firebaseAdmin');

const getProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    const profileDoc = await db.collection('profiles').doc(uid).get();

    if (!profileDoc.exists) {
      return res.status(200).json({ profile: null });
    }

    return res.status(200).json({ profile: profileDoc.data() });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Get user's role from users collection
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found in system' });
    }
    const role = userDoc.data().role;

    const profileData = { uid, role, ...req.body, updatedAt: new Date().toISOString() };
    
    await db.collection('profiles').doc(uid).set(profileData, { merge: true });

    return res.status(200).json({ message: 'Profile updated successfully', profile: profileData });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

module.exports = { getProfile, updateProfile };
