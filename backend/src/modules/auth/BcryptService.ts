import bcrypt from "bcryptjs";

export class BcryptService {
    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10)
    }

    async compare(plain: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(plain, hashed);
    }
}
