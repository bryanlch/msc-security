/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-namespace */
import { JwtPayload } from './jwt-payload';

declare global {
  namespace Express {
    export interface Request {
      user: JwtPayload;
    }
  }
}
