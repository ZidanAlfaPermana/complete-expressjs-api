import { Request, Response } from "express";
import { PesertaService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";

interface PesertaBody {
    nama: string;
    email: string;
    password: string;
    status: "aktif" | "berhenti" | "lulus";
    sekolah: string;
    role: "peserta" | "mentor"
    fase: number;
}

const pesertaService = new PesertaService();

export const getSemuaPeserta = asyncHandler(async (req: Request, res: Response) => {
    const { sekolah, fase, limit } = req.query;

    const data = await pesertaService.getSemuaPeserta({
        sekolah: sekolah as string,
        fase: fase ? Number(fase) : undefined,
        limit: limit ? Number(limit) : 20
    });

    res.json({ total: data.length, data });
});

export const getPesertaById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const peserta = await pesertaService.getPesertaById(id);

    if (!peserta) {
        res.status(404).json({ error: `Peserta dengan id ${id} tidak ditemukan` });
        return;
    }

    res.json(peserta);
});

export const buatPeserta = asyncHandler(async (req: Request<{}, {}, PesertaBody>, res: Response) => {
    const pesertaBaru = await pesertaService.buatPeserta(req.body);
    res.status(201).json(pesertaBaru);
});

export const updatePeserta = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const pesertaUpdated = await pesertaService.updatePeserta(id, req.body as PesertaBody);

    if (!pesertaUpdated) {
        res.status(404).json({ error: `Peserta dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(200).json({ message: `Peserta dengan id ${id} berhasil di edit`, data: pesertaUpdated });
});

export const hapusPeserta = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await pesertaService.hapusPeserta(id);

    if (!deleted) {
        res.status(404).json({ error: `Peserta dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(204).send();
});