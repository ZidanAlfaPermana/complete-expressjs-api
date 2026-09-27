import { Request, Response, NextFunction } from "express";
import {Skill} from "../entities";
import {MentorRepository, SkillRepository} from "../repositories";

export async function validasiPeserta(req: Request, res: Response, next: NextFunction) {
    const { nama, sekolah, email, skillIds, fase, status, telepon } = req.body;
    const errors: string[] = [];

    if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
        errors.push("Nama wajib diisi, minimal 3 karakter");
    }

    if (!sekolah || typeof sekolah !== "string") {
        errors.push("Sekolah wajib diisi");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        errors.push("Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)");
    }

    if (!status || !["selesai", "proses", "belum"].includes(status)) {
        errors.push("Status tidak valid. harus berisi selesai, proses, atau belum")
    }

    if (!telepon || typeof telepon !== "string") {
        errors.push("Telepon wajib diisi, tidak boleh kosong")
    }

    if (!fase || typeof fase !== "number" || (fase < 1 || fase > 5)) {
        errors.push("Fase wajib diisi, dan fase hanya ada fase 1 sampai 5");
    }

    if (skillIds !== undefined && !Array.isArray(skillIds)) {
        errors.push("skillIds harus berupa array berisi angka");
    }
    let validSkills: Skill[] = [];

    if (skillIds && skillIds.length > 0) {
        validSkills = await new SkillRepository().findByIds(skillIds);

        if (validSkills.length !== skillIds.length) {
            errors.push("Satu atau lebih ID Skill yang dikirim tidak ditemukan di database");
        }
    }

    if (errors.length > 0) {
        res.status(400).json({ error: "Validasi gagal", detail: errors });
        return;
    }

    next();
}

export async function validasiJurnal(req: Request, res: Response, next: NextFunction) {
    const { idPeserta, status, kegiatan, hambatan, rencanaBesok, linkCommit, review, reviewerId } = req.body;
    const errors: string[] = [];

    if (hambatan && typeof hambatan !== "string") {
        errors.push("Hambatan harus berupa teks");
    }

    if (!idPeserta || typeof idPeserta !== "number") {
        errors.push("ID peserta wajib diisi dan harus berupa angka");
    }

    const validMentor = await new MentorRepository().findById(reviewerId);

    if (!validMentor || typeof validMentor === null) {
        errors.push("Mentor yang dikirim tidak ditemukan di database");
    }

    if (!status || !["selesai", "proses", "belum"].includes(status)) {
        errors.push("Status wajib diisi, dengan memilih selesai, proses, atau belum");
    }

    if (!reviewerId || typeof reviewerId !== "number") {
        errors.push("ID reviewer (mentor) wajib diisi dan harus berupa angka");
    }

    if (!review || !["sudah", "belum"].includes(review)) {
        errors.push("Status Review wajib diisi, dengan memilih sudah, atau belum");
    }

    if (!kegiatan || typeof kegiatan !== "string" || kegiatan.trim().split(/\s+/).length < 10) {
        errors.push("Kegiatan wajib diisi, minimal 10 kata");
    }

    if (!rencanaBesok || typeof rencanaBesok !== "string" || rencanaBesok.trim().split(/\s+/).length < 10) {
        errors.push("Rencana besok wajib diisi, minimal 10 kata");
    }

    if (linkCommit !== undefined && linkCommit !== "") {
        if (typeof linkCommit !== "string" || !linkCommit.startsWith("https://github.com/")) {
            errors.push("Link commit harus valid dan diawali dengan https://github.com/");
        }
    }

    if (errors.length > 0) {
        res.status(400).json({ error: "Validasi gagal", detail: errors });
        return;
    }

    next();
}

export function validasiMentor(req: Request, res: Response, next: NextFunction): void {
    const { nama, email, keahlian } = req.body;
    const errors: string[] = [];

    if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
        errors.push("Nama mentor wajib diisi, minimal 3 karakter");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        errors.push("Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)");
    }

    if (keahlian !== undefined && !Array.isArray(keahlian)) {
        errors.push("Keahlian harus berupa array");
    }

    if (errors.length > 0) {
        res.status(400).json({ error: "Validasi gagal", detail: errors });
        return;
    }

    next();
}

export function validasiSkill(req: Request, res: Response, next: NextFunction): void {
    const { nama } = req.body;
    const errors: string[] = [];

    if (!nama || typeof nama !== "string" || nama.trim().length < 2) {
        errors.push("Nama skill wajib diisi, minimal 2 karakter");
    }

    if (errors.length > 0) {
        res.status(400).json({ error: "Validasi gagal", detail: errors });
        return;
    }

    next();
}