import { Request, Response } from "express";
import { SkillService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";
import { response } from "../utils";

const skillService = new SkillService();

export const getSemuaSkill = asyncHandler(async (req: Request, res: Response) => {
    const data = await skillService.getSemuaSkill();
    response.suksesDenganTotal(res, data);
});

export const getSkillById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const skill = await skillService.getSkillById(id);

    if (!skill) {
        response.gagal(res, `Skill dengan id ${id} tidak ditemukan`, [], 404);
        return;
    }

    response.sukses(res, skill);
});

export const buatSkill = asyncHandler(async (req: Request, res: Response) => {
    const skillBaru = await skillService.buatSkill(req.body);
    response.dibuat(res, skillBaru);
});

export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const skillUpdated = await skillService.updateSkill(id, req.body);

    if (!skillUpdated) {
        response.gagal(res, `Skill dengan id ${id} tidak ditemukan`, [], 404);
        return;
    }

    response.diubah(res, skillUpdated, `Skill dengan id ${id} berhasil di edit`);
});

export const hapusSkill = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await skillService.hapusSkill(id);

    if (!deleted) {
        response.gagal(res, `Skill dengan id ${id} tidak ditemukan`, [], 404);
        return;
    }

    response.sukses(res, [], "Data berhasil dihapus", 204);
});