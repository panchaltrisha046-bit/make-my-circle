const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Dev-only: create or find a dev user and return an auth token
exports.devAutoLogin = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.ENABLE_DEV_ROUTES) {
      return res.status(403).json({ message: 'Dev routes disabled' });
    }

    const email = process.env.DEV_USER_EMAIL || 'dev@local.test';
    const password = process.env.DEV_USER_PASSWORD || 'password123';

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName: 'Dev',
        lastName: 'User',
        email,
        phone: '+10000000000',
        password,
        photo: ''
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_fallback_key', { expiresIn: '30d' });

    res.status(200).json({ user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, photo: user.photo }, token });
  } catch (err) {
    res.status(500).json({ message: 'Dev login failed', error: err.message });
  }
};
