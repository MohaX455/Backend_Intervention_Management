import { AuthRepository } from "./AuthRepository.js";
import { UserRow } from "../../types/user.types.js";
import { BcryptService } from "../../shared/utils/BcryptService.js";
import { JWTService } from "./JWTService.js";

export class AuthService {
    constructor(
        private authRepo: AuthRepository,
        private bcryptService: BcryptService,
        private jwtService: JWTService
    ) { }

    // Login
    async login(email: string, password: string) {
        if (!email || !password) throw new Error("Email and password required");

        email = email.trim().toLowerCase();

        if (password.length < 8) throw new Error("Password must be at least 8 characters");

        const user: UserRow | null = await this.authRepo.findByEmail(email);
        if (!user) throw new Error("Invalid credentials");

        if (user.status !== "Active") throw new Error("Account not active");

        const match = await this.bcryptService.compare(password, user.password);
        if (!match) throw new Error("Invalid credentials");

        const GeneratedToken = this.jwtService.generate({ userId: user.id, userName: user.name, roleId: user.role_id })

        return { GeneratedToken, roleId: user.role_id };
    }

    // Login
    setPassword = async (token: string, password: string): Promise<void> => {
        if (!token || !password) {
            throw new Error('Token and password are required')
        }

        const user = await this.authRepo.findByToken(token)
        if (!user) {
            throw new Error('Invalid token')
        }

        if (user.invitation_expires_at && user.invitation_expires_at < new Date()) {
            throw new Error('Token has expired')
        }

        const hashedPassword = await this.bcryptService.hash(password)

        await this.authRepo.setPassword(user.id, hashedPassword)
    }
}
