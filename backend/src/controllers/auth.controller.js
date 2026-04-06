const jwt = require('jsonwebtoken');
const { query } = require('../config/queries');

const otpStore = {};

const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phone] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    console.log(`OTP for ${phone}: ${otp}`);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const stored = otpStore[phone];

    if (!stored) {
      return res.status(400).json({ message: 'OTP not sent for this number' });
    }

    if (Date.now() > stored.expiresAt) {
      delete otpStore[phone];
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    delete otpStore[phone];

    let result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    let user = result.rows[0];

    if (!user) {
      const newUser = await query(
        'INSERT INTO users (name, phone, role) VALUES ($1, $2, $3) RETURNING *',
        [name || 'Arena User', phone, 'user']
      );
      user = newUser.rows[0];
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendOtp, verifyOtp };