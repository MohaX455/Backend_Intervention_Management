import jwt from "jsonwebtoken";

interface JWTPayload {
  userId: number;
  roleId: number;
}

export class JWTService {
  generate(payload: JWTPayload): string {
    if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
      throw new Error("JWT_SECRET and JWT_EXPIRES_IN must be defined");
    }
    return (jwt.sign as any)(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
  }
}
