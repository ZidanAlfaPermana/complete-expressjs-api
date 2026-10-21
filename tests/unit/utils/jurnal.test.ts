import { JurnalService } from "../../../src/services/";
import {AppDataSource} from "../../../src/config/database.config";
import {JurnalHarian, Mentor, Peserta} from "../../../src/entities";

describe("getTotalJurnal saat repository error", () => {
    afterEach(() => jest.restoreAllMocks());
    it("SALAH: tanpa await/return", () => {
        jest.spyOn(AppDataSource, "getRepository").mockReturnValue({ count: jest.fn().mockRejectedValue(new Error("db mati")) } as any)

        new JurnalService(AppDataSource.getRepository(Peserta), AppDataSource.getRepository(JurnalHarian), AppDataSource.getRepository(Mentor)).getTotalJurnal().catch((err) => {
            expect(err.message).toBe("db mati");
        });
    });

    it("BENAR: await + expect.assertions", async () => {
        expect.assertions(1);
        jest.spyOn(AppDataSource, "getRepository").mockReturnValue({ count: jest.fn().mockRejectedValue(new Error("db mati")) } as any)

        try {
            await new JurnalService(AppDataSource.getRepository(Peserta), AppDataSource.getRepository(JurnalHarian), AppDataSource.getRepository(Mentor)).getTotalJurnal();
        } catch (err) {
            expect((err as Error).message).toBe("db mati");
        }
    });
});