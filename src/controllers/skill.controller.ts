import { Request, Response } from "express";
import { SkillService } from "../services";
import { asyncHandler } from "../utils/asyncHandler";

const skillService = new SkillService();

export const getSemuaSkill = asyncHandler(async (req: Request, res: Response) => {
    const data = await skillService.getSemuaSkill();
    res.json({ total: data.length, data });
});

export const getSkillById = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const skill = await skillService.getSkillById(id);

    if (!skill) {
        res.status(404).json({ error: `Skill dengan id ${id} tidak ditemukan` });
        return;
    }

    res.json(skill);
});

export const buatSkill = asyncHandler(async (req: Request, res: Response) => {
    const skillBaru = await skillService.buatSkill(req.body);
    res.status(201).json(skillBaru);
});

export const updateSkill = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const skillUpdated = await skillService.updateSkill(id, req.body);

    if (!skillUpdated) {
        res.status(404).json({ error: `Skill dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(200).json({ message: `Skill dengan id ${id} berhasil di edit`, data: skillUpdated });
});

export const hapusSkill = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const deleted = await skillService.hapusSkill(id);

    if (!deleted) {
        res.status(404).json({ error: `Skill dengan id ${id} tidak ditemukan` });
        return;
    }

    res.status(204).send();
});