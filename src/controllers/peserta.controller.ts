import { Request, Response } from "express";
import { PesertaService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { response } from "../utils";

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

    response.suksesDenganTotal(res, data);
});

export const getPesertaById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const peserta = await pesertaService.getPesertaById(id);

    if (!peserta) {
        response.gagal(res, `Peserta dengan id ${id} tidak ditemukan`, [], 404);
        return;
    }

    response.sukses(res, peserta);
});

export const buatPeserta = asyncHandler(async (req: Request<{}, {}, PesertaBody>, res: Response) => {
    const pesertaBaru = await pesertaService.buatPeserta(req.body);
    response.dibuat(res, pesertaBaru);
});

export const updatePeserta = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const pesertaUpdated = await pesertaService.updatePeserta(id, req.body as PesertaBody);

    if (!pesertaUpdated) {
        response.gagal(res, `Peserta dengan id ${id} tidak ditemukan`, [], 404);
        return;
    }

    response.diubah(res, pesertaUpdated, `Peserta dengan id ${id} berhasil di edit`);
});

export const hapusPeserta = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await pesertaService.hapusPeserta(id);

    if (!deleted) {
        response.gagal(res, `Peserta dengan id ${id} tidak ditemukan`, [], 404);
        return;
    }

    response.sukses(res, [], "Data berhasil dihapus", 204);
});