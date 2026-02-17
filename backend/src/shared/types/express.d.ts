import { JwtPayload } from "jsonwebtoken";

declare module "express" {
  interface Request {
    user?: JwtPayload & { id: number; name: string; role: number };
  }
}
