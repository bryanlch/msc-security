/* eslint-disable prettier/prettier */
export interface JwtPayload {
  sub: User;
  exp: number;
  jti: string;
  iat: number;
}
interface User {
  id: number;
  email: string;
  name?: string;
  lastName?: string;
  phone?: string;
}
