import { AuthRepository } from "./AuthRepository.js";
import { UserRow } from "./auth.types.js";
import { BcryptService } from "./BcryptService.js";
import { JWTService } from "./JWTService.js";

export class AuthService {
    constructor(
        private authRepo: AuthRepository,
        private bcryptService: BcryptService,
        private jwtService: JWTService
    ) { }

    async login(email: string, password: string) {
        if (!email || !password) throw new Error("Email and password required");

        email = email.trim().toLowerCase();

        if (password.length < 8) throw new Error("Password must be at least 8 characters");

        const user: UserRow | null = await this.authRepo.findByEmail(email);
        if (!user) throw new Error("Invalid credentials");

        const match = await this.bcryptService.compare(password, user.password);
        if (!match) throw new Error("Invalid credentials");

        return this.jwtService.generate({ userId: user.id, roleId: user.role_id })
    }
}
