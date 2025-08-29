import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import dotenv from 'dotenv';

dotenv.config();
const { ACCESS_TOKEN_SECRET } = process.env;

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createHttpError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    let payload;
    try {
      payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw createHttpError(401, 'Access token expired');
      } else {
        throw createHttpError(401, 'Invalid token');
      }
    }

    req.user = { id: payload.userId };
    next();
  } catch (err) {
    next(err);
  }
};
