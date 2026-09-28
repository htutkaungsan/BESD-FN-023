const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();
const REQUIRED_FIELDS = ['userEmail', 'userPassword', 'userFirstName', 'userLastName', 'userTel', 'dateOfBirth'];

function getAge(dateOfBirth) {
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday = today.getUTCMonth() < dob.getUTCMonth() ||
    (today.getUTCMonth() === dob.getUTCMonth() && today.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function publicUser(row) {
  return {
    userEmail: row.userEmail,
    userFirstName: row.userFirstName,
    userLastName: row.userLastName,
    userTel: row.userTel,
    dateOfBirth: row.dateOfBirth,
    age: getAge(row.dateOfBirth),
  };
}

async function createUser(req, res, next) {
  try {
    const input = req.body || {};
    const missing = REQUIRED_FIELDS.filter((field) => input[field] === undefined || input[field] === null || input[field] === '');
    if (missing.length) {
      return res.status(400).json({ error: 'Missing mandatory fields.', missingFields: missing });
    }
    const email = String(input.userEmail).trim().toLowerCase();
    const password = String(input.userPassword);
    if (email.length > 85 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'userEmail must be a valid email address (maximum 85 characters).' });
    }
    if (!/^[a-zA-Z0-9]{8,15}$/.test(password)) {
      return res.status(400).json({ error: 'userPassword must contain 8-15 alphanumeric characters.' });
    }
    for (const field of ['userFirstName', 'userLastName', 'userTel']) {
      if (String(input[field]).length > 50) return res.status(400).json({ error: `${field} must be at most 50 characters.` });
    }
    const dob = String(input.dateOfBirth);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || Number.isNaN(Date.parse(`${dob}T00:00:00Z`)) || new Date(`${dob}T00:00:00Z`).toISOString().slice(0, 10) !== dob) {
      return res.status(400).json({ error: 'dateOfBirth must be a valid date in YYYY-MM-DD format.' });
    }
    if (new Date(`${dob}T00:00:00Z`) > new Date()) return res.status(400).json({ error: 'dateOfBirth cannot be in the future.' });

    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS || 10));
    await pool.execute(
      'INSERT INTO `user` (userEmail, userPassword, userFirstName, userLastName, userTel, dateOfBirth) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hash, input.userFirstName, input.userLastName, input.userTel, dob],
    );
    return res.status(201).json({ message: 'Created' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists.' });
    return next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const [rows] = await pool.execute('SELECT userEmail, userFirstName, userLastName, userTel, dateOfBirth FROM `user` ORDER BY userEmail');
    return res.status(200).json(rows.map(publicUser));
  } catch (error) {
    return next(error);
  }
}

router.post('/', createUser);
router.post('/signup', createUser);
router.get('/', listUsers);
router.get('/list', listUsers);

module.exports = router;
