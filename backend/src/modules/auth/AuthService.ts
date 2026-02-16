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

    async login(name: string, password: string) {
        if (!name || !password) throw new Error("Name and password required");

        if (password.length < 8) throw new Error("Password must be at least 6 characters");

        const user: UserRow | null = await this.authRepo.findByName(name);
        if (!user) throw new Error("Invalid credentials");

        const match = await this.bcryptService.compare(password, user.password);
        if (!match) throw new Error("Invalid credentials");

        const token = this.jwtService.generate({ userId: user.id, roleId: user.role_id });

        return { token };
    }
}
