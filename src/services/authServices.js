import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import User from '../db/models/User.js';
import Session from '../db/models/Session.js';
import { JWT } from '../constants/index.js'; // constants'ten al

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createHttpError(409, 'Email in use');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  return user.toJSON();
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, 'Email or password is wrong');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createHttpError(401, 'Email or password is wrong');

  await Session.deleteMany({ userId: user._id.toString() });

  const accessToken = jwt.sign(
    { userId: user._id.toString() },
    JWT.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id.toString() },
    JWT.REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' }
  );

  await Session.create({
    userId: user._id.toString(),
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
};

export const refreshSession = async (refreshToken) => {
  if (!refreshToken) throw createHttpError(401, 'No refresh token provided');

  let payload;
  try {
    payload = jwt.verify(refreshToken, JWT.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw createHttpError(401, 'Invalid refresh token', error);
  }

  const existingSession = await Session.findOne({ refreshToken });
  if (!existingSession) throw createHttpError(401, 'Session not found');

  await Session.deleteMany({ userId: payload.userId });

  const newAccessToken = jwt.sign(
    { userId: payload.userId },
    JWT.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
  const newRefreshToken = jwt.sign(
    { userId: payload.userId },
    JWT.REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' }
  );

  await Session.create({
    userId: payload.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + 15 * 60 * 1000),
    refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) throw createHttpError(401, 'No refresh token provided');

  const deletedSession = await Session.findOneAndDelete({ refreshToken });
  if (!deletedSession) throw createHttpError(401, 'Session not found');
};
