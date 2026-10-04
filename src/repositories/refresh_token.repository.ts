import { AppDataSource } from "../config/database.config";
import {RefreshToken} from "../entities";

export class RefreshTokenRepository {
    private repo = AppDataSource.getRepository(RefreshToken);

    async findOneBy(token: string) {
        return this.repo.findOneBy({token: token});
    }

    async save(data: Partial<RefreshToken>) {
        return this.repo.save(data);
    }

    async delete(token: string) {
        return this.repo.delete({ token });
    }
}