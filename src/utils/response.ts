import { Response } from "express";
import { tanpaPassword } from "./password";

export function sukses<T>(
    res: Response,
    data?: T,
    pesan: string = "Berhasil",
    statusCode: number = 200
): void {
    const dataBersih = tanpaPassword(data);
    res.status(statusCode).json({ sukses: true, pesan, dataBersih });
}

export function suksesDenganTotal<T>(
    res: Response,
    data: T[],
    pesan: string = "Berhasil"
): void {
    const dataBersih = data.map(item => tanpaPassword(item));
    res.status(200).json({ sukses: true, pesan, total: data.length, dataBersih });
}

export function dibuat<T>(res: Response, data: T, pesan: string = "Data berhasil dibuat"): void {
    const dataBersih = tanpaPassword(data);
    res.status(201).json({ sukses: true, pesan, dataBersih });
}

export function diubah<T>(res: Response, data: T, pesan: string = "Data berhasil diedit"): void {
    const dataBersih = tanpaPassword(data);
    res.status(200).json({ sukses: true, pesan, dataBersih });
}

export function gagal<T>(res: Response, pesan: string = "Data gagal diproses", errors: T[], code: number = 500): void {
    res.status(code).json({ sukses: false, pesan, errors });
}