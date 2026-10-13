import { Router } from "express";
import { SkillController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware } from "../middlewares";
import {SkillDto} from "../dto/skill.dto";

const router = Router();

router.get("/", SkillController.getSemuaSkill);
router.get("/:id", SkillController.getSkillById);
router.post("/", AuthMiddleware.authGuard, ValidationMiddleware.validasi(SkillDto), SkillController.buatSkill);
router.put("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasi(SkillDto), SkillController.updateSkill);
router.delete("/:id", AuthMiddleware.authGuard, SkillController.hapusSkill);

export default router;