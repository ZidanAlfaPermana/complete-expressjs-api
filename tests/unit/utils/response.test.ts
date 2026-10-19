import { Response } from "express";
import * as response from "../../../src/utils/response";

const KUNCI_DATA = "dataBersih";

function buatMockRes(): Response {
    const res = { status: jest.fn(), json: jest.fn() } as unknown as Response;
    (res.status as jest.Mock).mockReturnValue(res);
    return res;
}

describe.each([
    ["dibuat", response.dibuat, 201, "Data berhasil dibuat"],
    ["diubah", response.diubah, 200, "Data berhasil diedit"],
] as const)("response.%s", (_nama, fn, statusHarapan, pesanDefault) => {
    it(`mengirim status ${statusHarapan}`, () => {
        const res = buatMockRes();

        fn(res, { id: 1, nama: "Budi" });

        expect(res.status).toHaveBeenCalledWith(statusHarapan);
    });

    it("mengirim body { sukses: true, pesan, data } dengan pesan default", () => {
        const res = buatMockRes();

        fn(res, { id: 1, nama: "Budi" });

        expect(res.json).toHaveBeenCalledWith({
            sukses: true,
            pesan: pesanDefault,
            [KUNCI_DATA]: { id: 1, nama: "Budi" },
        });
    });

    it("memakai pesan kustom bila diberikan", () => {
        const res = buatMockRes();

        fn(res, { id: 1 }, "Pesan buatan sendiri");

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ pesan: "Pesan buatan sendiri" })
        );
    });

    it("membuang password dari data yang dikirim", () => {
        const res = buatMockRes();

        fn(res, { id: 1, nama: "Budi", password: "$2b$10$hashrahasia" });

        const body = (res.json as jest.Mock).mock.calls[0][0];
        expect(body[KUNCI_DATA]).toStrictEqual({ id: 1, nama: "Budi" });
        expect(JSON.stringify(body)).not.toContain("password");
        expect(JSON.stringify(body)).not.toContain("hashrahasia");
    });

    it("memanggil res.status dan res.json masing-masing satu kali", () => {
        const res = buatMockRes();

        fn(res, { id: 1 });

        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledTimes(1);
    });
});