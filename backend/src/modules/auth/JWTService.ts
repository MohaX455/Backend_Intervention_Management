import jwt from "jsonwebtoken";

interface JWTPayload {
  userId: number;
  userName: string;
  roleId: number;
}

interface JWTConfig {
  secret: string;
  expiresIn: string;
}

export class JWTService {
  constructor(private config: JWTConfig) {}

  generate(payload: JWTPayload): string {
    return (jwt.sign as any)(payload, this.config.secret, {
      expiresIn: this.config.expiresIn
    });
  }
}