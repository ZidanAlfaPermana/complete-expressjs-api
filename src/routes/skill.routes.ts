import { Router } from "express";
import { SkillController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware } from "../middlewares";

const router = Router();

router.get("/", SkillController.getSemuaSkill);
router.get("/:id", SkillController.getSkillById);
router.post("/", ValidationMiddleware.validasiSkill, SkillController.buatSkill);
router.put("/:id", ValidationMiddleware.validasiSkill, SkillController.updateSkill);
router.delete("/:id", AuthMiddleware.cekApiKey, SkillController.hapusSkill);

export default router;