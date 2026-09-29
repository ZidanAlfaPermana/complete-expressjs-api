import { Request, Response } from "express";
import { MentorService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { response } from "../utils";

const mentorService = new MentorService();

export const getSemuaMentor = asyncHandler(async (req: Request, res: Response) => {
    const data = await mentorService.getSemuaMentor();
    response.suksesDenganTotal(res, data);
});

export const getMentorById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const mentor = await mentorService.getMentorById(id);

    if (!mentor) {
        response.gagal(res, `Mentor dengan id ${id} tidak ditemukan`, [], 404);
        return;
    }

    response.sukses(res, mentor);
});

export const buatMentor = asyncHandler(async (req: Request, res: Response) => {
    const mentorBaru = await mentorService.buatMentor(req.body);
    response.dibuat(res, mentorBaru);
});

export const updateMentor = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const mentorUpdated = await mentorService.updateMentor(id, req.body);

    if (!mentorUpdated) {
        response.gagal(res, `Mentor dengan id ${id} tidak ditemukan`, [], 404);
        return;
    }

    response.diubah(res, mentorUpdated, `Mentor dengan id ${id} berhasil di edit`);
});

export const hapusMentor = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await mentorService.hapusMentor(id);

    if (!deleted) {
        response.gagal(res, `Mentor dengan id ${id} tidak ditemukan`, [], 404);
        return;
    }

    response.sukses(res, [], "Data berhasil dihapus", 204);
});