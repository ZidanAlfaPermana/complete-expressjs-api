// tests/helpers/dto.ts
import { FieldError, ValidationError } from "../../src/utils/AppError";

// Mengembalikan daftar nama field yang gagal validasi (array kosong jika valid)
export async function fieldYangGagal(proses: Promise<unknown>): Promise<string[]> {
    try {
        await proses;
        return [];
    } catch (err) {
        if (err instanceof ValidationError) {
            return (err.detail as FieldError[]).map((d) => d.field);
        }
        throw err;   // error jenis lain berarti bug sungguhan, biarkan test gagal
    }
}