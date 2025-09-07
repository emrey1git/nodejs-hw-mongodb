import User from '../db/models/User.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshSession,
} from '../services/authServices.js';
import nodemailer from 'nodemailer';
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const newUser = await registerUser({ name, email, password });

    res.status(201).json({
      status: 'success',
      message: 'Successfully registered a user!',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await loginUser({ email, password });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 gün
    });

    res.status(200).json({
      status: 'success',
      message: 'Successfully logged in an user!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    const { accessToken, refreshToken: newRefreshToken } = await refreshSession(
      refreshToken
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: 'success',
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) throw new Error('No refresh token provided');

    await logoutUser(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const sendResetEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email) res.status(400).json({ message: 'Email is required' });
  try {
    const user = await User.findOne({ email });
    if (!user) res.status(404).json({ message: 'User not found' });

    //reset token
    const resetToken = user.createPasswordResetToken();

    //kullanıcıyı kaydet
    await user.save({ validateBeforeSave: false });

    //şifre sıfırlama
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/auth/reset-password/${resetToken}`;

    //nodemailer

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Your App" <no-reply@yourapp.com>',
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Şifre sıfırlama linkiniz: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });
    res.status(200).json({ message: 'Reset email sent' });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
