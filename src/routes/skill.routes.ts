import { Router } from "express";
import { SkillController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware } from "../middlewares";

const router = Router();

router.get("/", SkillController.getSemuaSkill);
router.get("/:id", SkillController.getSkillById);
router.post("/", AuthMiddleware.authGuard, ValidationMiddleware.validasiSkill, SkillController.buatSkill);
router.put("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasiSkill, SkillController.updateSkill);
router.delete("/:id", AuthMiddleware.authGuard, SkillController.hapusSkill);

export default router;