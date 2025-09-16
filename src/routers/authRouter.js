import express from 'express';
import {
  register,
  login,
  refresh,
  logout,
  sendResetEmail,
  resetPassword,
} from '../controllers/authControllers.js';
import validateBody from '../middlewares/validateBody.js';
import Joi from 'joi';

const router = express.Router();

// Body doğrulama şemaları
const resetPwdSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/send-reset-email', sendResetEmail);
router.post('/reset-pwd', validateBody(resetPwdSchema), resetPassword);

export default router;
