import jwt, { SignOptions } from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'ADMIN' | 'COUNSELOR';
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRY ? parseInt(process.env.JWT_EXPIRY, 10) : 900,
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: process.env.JWT_REFRESH_EXPIRY ? parseInt(process.env.JWT_REFRESH_EXPIRY, 10) : 604800,
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret', options);
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as TokenPayload;
};
