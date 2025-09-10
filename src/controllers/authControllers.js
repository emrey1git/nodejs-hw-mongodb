import User from '../db/models/User.js';
import { registerUser, loginUser, logoutUser, refreshSession } from '../services/authServices.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

// Kullanıcı kaydı
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const newUser = await registerUser({ name, email, password });
    res.status(201).json({ status: 'success', message: 'Successfully registered a user!', data: newUser });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await loginUser({ email, password });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ status: 'success', message: 'Successfully logged in an user!', data: { accessToken } });
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const { accessToken, refreshToken: newRefreshToken } = await refreshSession(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ status: 'success', message: 'Successfully refreshed a session!', data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) throw new Error('No refresh token provided');

    await logoutUser(refreshToken);
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Şifre sıfırlama maili gönderme (Adım 3)
export const sendResetEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(createHttpError(400, 'Email is required'));

  try {
    const user = await User.findOne({ email });
    if (!user) return next(createHttpError(404, 'User not found!'));

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '5m' });
    const resetUrl = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Şifre sıfırlama linkiniz: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.status(200).json({ status: 200, message: 'Reset password email has been successfully sent.', data: {} });
  } catch (error) {
    console.error(error);
    next(createHttpError(500, 'Failed to send the email, please try again later.'));
  }
};

// Şifre resetleme (Adım 4)
export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });
    if (!user) return next(createHttpError(404, 'User not found!'));

    user.password = password;
    await user.save();

    // Burada refresh tokenları temizlemek için session tabanlı bir model varsa kullanılabilir

    res.status(200).json({ status: 200, message: 'Password has been successfully reset.', data: {} });
  } catch (err) {
    next(createHttpError(401, 'Token is expired or invalid.',err));
  }
};
