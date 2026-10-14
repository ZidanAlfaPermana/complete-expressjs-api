// src/dto/decorators/transform.ts
import { Transform } from "class-transformer";

export const Trim = () =>
    Transform(({ value }) => (typeof value === "string" ? value.trim() : value));

export const KeHurufKecil = () =>
    Transform(({ value }) => (typeof value === "string" ? value.toLowerCase() : value));

export const KeHurufBesar = () =>
    Transform(({ value }) => (typeof value === "string" ? value.toUpperCase() : value));

export const KeBoolean = () =>
    Transform(({ value }) => {
        if (value === "true" || value === true) return true;
        if (value === "false" || value === false) return false;
        return value;   // biarkan apa adanya, nanti ditolak oleh @IsBoolean
    });