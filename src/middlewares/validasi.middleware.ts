import { Request, Response, NextFunction } from "express";
import {dataPeserta} from "../data/dummy";
import {errorHandler} from "./error.middleware";

export function validasiPeserta(req: Request, res: Response, next: NextFunction): void {
    const { nama, sekolah, kelas, jurusan, fase } = req.body;
    const errors: string[] = [];

    if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
        errors.push("Nama wajib diisi, minimal 3 karakter");
    }
    if (!kelas || typeof kelas !== "string" || nama.trim().length < 3) {
        errors.push("Kelas wajib diisi, minimal 3 karakter");
    }
    if (!jurusan || typeof jurusan !== "string" || nama.trim().length < 3) {
        errors.push("Jurusan wajib diisi, minimal 3 karakter");
    }

    if (!sekolah || typeof sekolah !== "string") {
        errors.push("Sekolah wajib diisi");
    }

    if (!fase || typeof fase !== "number" || (fase < 1 || fase > 5)) {
        errors.push("Fase wajib diisi, dan fase hanya ada fase 1 sampai 5");
    }

    if (errors.length > 0) {
        res.status(400).json({error: "Validasi gagal", detail: errors});
        return;
    }

    next();
}

export function validasiJurnal(req: Request, res: Response, next: NextFunction): void {
    const { idPeserta, status, kegiatan, hambatan, rencanaBesok, linkCommit, review } = req.body;
    const errors: string[] = [];

    if (hambatan && typeof hambatan !== "string") {
        errors.push("Hambatan harus berupa teks");
    }

    if (!idPeserta || typeof idPeserta !== "number") {
        errors.push("id peserta wajib diisi");
    }

    const pesertaExists = dataPeserta.find((p) => p.id === idPeserta);
    if (!pesertaExists) {
        errors.push(`Id peserta ${idPeserta} tidak ada`)
    }

    if (!status || !["selesai", "proses", "belum"].includes(status)) {
        errors.push("Status wajib diisi, dengan memilih selesai, proses, atau belum");
    }

    if (!review || !["sudah", "belum"].includes(review)) {
        errors.push("Status Review wajib diisi, dengan memilih sudah, atau belum");
    }

    if (!kegiatan || typeof kegiatan !== "string" || kegiatan.length < 10) {
        errors.push("Kegiatan wajib diisi, minimal 10 kata");
    }

    if (!rencanaBesok || typeof rencanaBesok !== "string" || kegiatan.length < 10) {
        errors.push("Rencana besok wajib diisi, minimal 10 kata");
    }

    if (typeof linkCommit !== "string" && URL.canParse(linkCommit)) {
        errors.push("link commit wajib diisi, dan link commit harus valid dengan diawali https://github.com");
    }

    if (errors.length > 0) {
        res.status(400).json({error: "Validasi gagal", detail: errors});
        return;
    }

    next();
}