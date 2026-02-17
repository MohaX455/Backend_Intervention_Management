import { AuthRepository } from "./AuthRepository.js";
import { UserRow } from "./auth.types.js";
import { BcryptService } from "./BcryptService.js";
import { JWTService } from "./JWTService.js";
import { AppError } from "../../shared/errors/AppError.js";

export class AuthService {
    constructor(
        private authRepo: AuthRepository,
        private bcryptService: BcryptService,
        private jwtService: JWTService
    ) { }

    async login(name: string, password: string) {

        if (password.length < 8) throw new AppError("Password must be at least 8 characters", 400);

        const user: UserRow | null = await this.authRepo.findByName(name);
        if (!user) throw new AppError("Invalid credentials", 401);

        const match = await this.bcryptService.compare(password, user.password);
        if (!match) throw new AppError("Invalid credentials", 401);

        const token = this.jwtService.generate({ id: user.id, name: name, role: user.role_id });

        return { token, user_role: user.role_id };
    }
}
