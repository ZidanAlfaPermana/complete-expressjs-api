import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { IsString, validate } from "class-validator";
import { Sama } from "../../../src/dto/decorators/sama";

class ContohDto {
    @IsString()
    kataSandi!: string;

    @Sama("kataSandi")
    konfirmasi!: string;
}

async function cek(payload: object) {
    const instance = plainToInstance(ContohDto, payload);
    return validate(instance);
}

describe("Decorator Sama", () => {
    it.each([
        ["teks biasa", { kataSandi: "rahasia123", konfirmasi: "rahasia123" }],
        ["karakter khusus", { kataSandi: "P@ss w0rd!", konfirmasi: "P@ss w0rd!" }],
        ["satu karakter", { kataSandi: "a", konfirmasi: "a" }],
    ])("nilai sama lolos: %s", async (_label, payload) => {
        const errors = await cek(payload);
        expect(errors).toHaveLength(0);
    });

    it.each([
        ["beda total", { kataSandi: "rahasia123", konfirmasi: "beda12345" }],
        ["beda huruf besar", { kataSandi: "rahasia123", konfirmasi: "Rahasia123" }],
        ["beda spasi", { kataSandi: "rahasia123", konfirmasi: "rahasia123 " }],
        ["kosong", { kataSandi: "rahasia123", konfirmasi: "" }],
    ])("nilai berbeda gagal: %s", async (_label, payload) => {
        const errors = await cek(payload);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe("konfirmasi");
    });

    it("pesan error berisi nama field yang dibandingkan", async () => {
        const errors = await cek({ kataSandi: "rahasia123", konfirmasi: "beda12345" });
        const pesan = Object.values(errors[0].constraints ?? {}).join(" ");
        expect(pesan).toContain("kataSandi");
    });

    it("pesan error tidak membocorkan nilai kedua field", async () => {
        const errors = await cek({ kataSandi: "rahasia123", konfirmasi: "beda12345" });
        const pesan = Object.values(errors[0].constraints ?? {}).join(" ");
        expect(pesan).not.toContain("rahasia123");
        expect(pesan).not.toContain("beda12345");
    });
});