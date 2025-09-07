import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  sendResetEmail,
} from '../controllers/authControllers.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
// POST /auth/send-reset-email
router.post('/send-reset-email', sendResetEmail);

export default router;
