// src/utils/serialisasi.ts
import { ClassConstructor, plainToInstance } from "class-transformer";

export function serialisasi<T>(dto: ClassConstructor<T>, data: unknown[]): T[];
export function serialisasi<T>(dto: ClassConstructor<T>, data: unknown): T;
export function serialisasi<T>(dto: ClassConstructor<T>, data: unknown): T | T[] {
    // excludeExtraneousValues: hanya properti ber-@Expose yang dibawa keluar
    return plainToInstance(dto, data, { excludeExtraneousValues: true }) as T | T[];
}