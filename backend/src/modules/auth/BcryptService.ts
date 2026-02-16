import bcrypt from "bcryptjs";

export class BcryptService {
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
