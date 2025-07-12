import { type Request } from 'express';

export interface JwtPayload {
  _id: string;
  iat: number;
  exp: number;
}

export interface CustomRequest extends Request {
  user: JwtPayload;
}
