// tests/unit/dto/jurnal-query.test.ts
import "reflect-metadata";
import {validasiDto} from "../../../src/utils/validasi.util";
import {ListJurnalQueryDto} from "../../../src/dto/jurnal.dto";
import {fieldYangGagal} from "../../helpers/dto";

it("belumDireview=false benar-benar bernilai false (bukan true)", async () => {
    const q = await validasiDto(ListJurnalQueryDto, { belumDireview: "false" }, "query");
    expect(q.belumDireview).toBe(false);
});

it("belumDireview=abc ditolak", async () => {
    const gagal = await fieldYangGagal(validasiDto(ListJurnalQueryDto, { belumDireview: "abc" }, "query"));
    expect(gagal).toContain("belumDireview");
});