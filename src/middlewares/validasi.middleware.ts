import { Request, Response, NextFunction } from "express";
import {Skill} from "../entities";
import {MentorRepository, SkillRepository} from "../repositories";
import {FieldError, ValidationError} from "../utils/AppError";

export async function validasiPeserta(req: Request, res: Response, next: NextFunction) {
    const { nama, sekolah, email, skillIds, fase, status, telepon, role, password } = req.body;
    const errors: FieldError[] = [];

    if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
        errors.push({ field: "nama", pesan: "Nama wajib diisi, minimal 3 karakter" });
    }

    if (!sekolah || typeof sekolah !== "string") {
        errors.push({ field: "sekolah", pesan: "Sekolah wajib diisi" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        errors.push({ field: "email", pesan: "Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)" });
    }

    if (!status || !["aktif", "lulus", "berhenti"].includes(status)) {
        errors.push({ field: "status", pesan: "Status tidak valid. harus berisi aktif, lulus, atau berhenti" })
    }

    if (!telepon || typeof telepon !== "string") {
        errors.push({ field: "telepon", pesan: "Telepon wajib diisi, tidak boleh kosong" })
    }

    if (!fase || typeof fase !== "number" || (fase < 1 || fase > 5)) {
        errors.push({ field: "fase", pesan: "Fase wajib diisi, dan fase hanya ada fase 1 sampai 5" });
    }

    if (skillIds !== undefined && !Array.isArray(skillIds)) {
        errors.push({ field: "skillIds", pesan: "skillIds harus berupa array berisi angka" });
    }
    let validSkills: Skill[] = [];

    if (Array.isArray(skillIds) && skillIds.length > 0) {
        validSkills = await new SkillRepository().findByIds(skillIds);

        if (validSkills.length !== skillIds.length) {
            errors.push({ field: "skillIds", pesan: "Satu atau lebih ID Skill yang dikirim tidak ditemukan di database" });
        }
    }

    if (!role || !["peserta", "mentor"].includes(role)) {
        errors.push({ field: "role", pesan: "Role wajib diisi, dengan memilih role peserta atau mentor" })
    }

    if (!password || typeof password !== "string") {
        errors.push({ field: "password", pesan: "Password harus diisi, tidak boleh kosong" })
    } else if (password.length < 8) {
        errors.push({ field: "password", pesan: "Password minimal 8 karakter" })
    }

    if (errors.length > 0) {
        next(new ValidationError(errors));
        return;
    }

    next();
}

export async function validasiJurnal(req: Request, res: Response, next: NextFunction) {
    const { pesertaId, status, kegiatan, hambatan, rencanaBesok, linkCommit, review, reviewerId} = req.body;
    const errors: FieldError[] = [];

    if (hambatan && typeof hambatan !== "string") {
        errors.push({ field: "hambatan", pesan: "Hambatan harus berupa teks" });
    }

    if (!pesertaId || typeof pesertaId !== "number") {
        errors.push({ field: "pesertaId", pesan: "ID peserta wajib diisi dan harus berupa angka" });
    }

    if (!status || !["selesai", "proses", "belum"].includes(status)) {
        errors.push({ field: "status", pesan: "Status wajib diisi, dengan memilih selesai, proses, atau belum" });
    }

    if (!reviewerId || typeof reviewerId !== "number") {
        errors.push({ field: "reviewerId", pesan: "ID reviewer (mentor) wajib diisi dan harus berupa angka" });
    } else {
        const validMentor = await new MentorRepository().findById(reviewerId);
        if (!validMentor) {
            errors.push({ field: "reviewerId", pesan: "Mentor yang dikirim tidak ditemukan di database" });
        }
    }

    if (!review || !["sudah", "belum"].includes(review)) {
        errors.push({ field: "review", pesan: "Status Review wajib diisi, dengan memilih sudah, atau belum" });
    }

    if (!kegiatan || typeof kegiatan !== "string" || kegiatan.trim().split(/\s+/).length < 10) {
        errors.push({ field: "kegiatan", pesan: "Kegiatan wajib diisi, minimal 10 kata" });
    }

    if (!rencanaBesok || typeof rencanaBesok !== "string" || rencanaBesok.trim().split(/\s+/).length < 10) {
        errors.push({ field: "rencanaBesok", pesan: "Rencana besok wajib diisi, minimal 10 kata" });
    }

    if (linkCommit !== undefined && linkCommit !== "") {
        if (typeof linkCommit !== "string" || !linkCommit.startsWith("https://github.com/")) {
            errors.push({ field: "linkCommit", pesan: "Link commit harus valid dan diawali dengan https://github.com/" });
        }
    }

    if (errors.length > 0) {
        next(new ValidationError(errors));
        return;
    }

    next();
}

export function validasiMentor(req: Request, res: Response, next: NextFunction): void {
    const { nama, email, keahlian } = req.body;
    const errors: FieldError[] = [];

    if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
        errors.push({ field: "nama", pesan: "Nama mentor wajib diisi, minimal 3 karakter" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        errors.push({ field: "email", pesan: "Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)" });
    }

    if (keahlian !== undefined && !Array.isArray(keahlian)) {
        errors.push({ field: "keahlian", pesan: "Keahlian harus berupa array" });
    }

    if (errors.length > 0) {
        next(new ValidationError(errors));
        return;
    }

    next();
}

export function validasiSkill(req: Request, res: Response, next: NextFunction): void {
    const { nama } = req.body;
    const errors: FieldError[] = [];

    if (!nama || typeof nama !== "string" || nama.trim().length < 2) {
        errors.push({ field: "nama", pesan: "Nama skill wajib diisi, minimal 2 karakter" });
    }

    if (errors.length > 0) {
        next(new ValidationError(errors));
        return;
    }

    next();
}

export function validasiRegister(req: Request, res: Response, next: NextFunction): void {
    const { nama, sekolah, email, password } = req.body;
    const errors: FieldError[] = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        errors.push({ field: "email", pesan: "Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)" });
    }

    if (!nama || typeof nama !== "string" || nama.trim().length < 3) {
        errors.push({ field: "nama", pesan: "Nama wajib diisi, minimal 3 karakter" });
    }

    if (!sekolah || typeof sekolah !== "string") {
        errors.push({ field: "sekolah", pesan: "Sekolah wajib diisi" });
    }

    if (!password || typeof password !== "string") {
        errors.push({ field: "password", pesan: "Password harus diisi, tidak boleh kosong" })
    } else if (password.length < 8) {
        errors.push({ field: "password", pesan: "Password minimal 8 karakter" })
    }

    if (errors.length > 0) {
        next(new ValidationError(errors));
        return;
    }

    next();
}

export function validasiLogin(req: Request, res: Response, next: NextFunction): void {
    const { email, password } = req.body;
    const errors: FieldError[] = [];

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== "string" || !emailRegex.test(email)) {
        errors.push({ field: "email", pesan: "Email wajib diisi dan formatnya harus valid (contoh: mentor@gmail.com)" });
    }

    if (!password || typeof password !== "string") {
        errors.push({ field: "password", pesan: "Password harus diisi, tidak boleh kosong" })
    } else if (password.length < 8) {
        errors.push({ field: "password", pesan: "Password minimal 8 karakter" })
    }

    if (errors.length > 0) {
        next(new ValidationError(errors));
        return;
    }

    next();
}