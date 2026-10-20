// src/utils/validasi.util.ts
import { ValidationError as ClassValidatorError } from "class-validator";
import { FieldError } from "./AppError";

import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ValidationError } from "./AppError";

export type Sumber = "body" | "query" | "params";

export function ratakan(
    errors: ClassValidatorError[],
    awalan: string = ""
): FieldError[] {
    return errors.flatMap((e) => {
        const field = awalan ? `${awalan}.${e.property}` : e.property;

        const pesanSendiri: FieldError[] = Object.entries(e.constraints ?? {}).map(
            ([jenis, pesan]) => ({
                field,
                // Pesan bawaan untuk properti asing berbahasa Inggris, kita ganti
                pesan: jenis === "whitelistValidation" ? "Properti ini tidak diizinkan" : pesan,
            })
        );

        // Objek/array bersarang punya children, ratakan secara rekursif
        const pesanAnak = e.children?.length ? ratakan(e.children, field) : [];

        return [...pesanSendiri, ...pesanAnak];
    });
}


export async function validasiDto<T extends object>(
    dto: ClassConstructor<T>,
    mentah: unknown,
    sumber: Sumber = "body"
): Promise<T> {
    const data = mentah ?? {};

    if (typeof data !== "object" || data === null || Array.isArray(data)) {
        throw new ValidationError([{ field: sumber, pesan: `${sumber} harus berupa objek` }]);
    }

    const instance = plainToInstance(dto, data as Record<string, unknown>, {
        exposeDefaultValues: true,
    });

    const errors = await validate(instance, {
        whitelist: true,
        forbidNonWhitelisted: sumber === "body",
        validationError: { target: false, value: false },
    });

    if (errors.length > 0) {
        throw new ValidationError(ratakan(errors));
    }

    return instance;
}