import { Router } from "express";
import { MentorController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware } from "../middlewares";

const router = Router();

router.get("/", MentorController.getSemuaMentor);
router.get("/:id", MentorController.getMentorById);
router.post("/", ValidationMiddleware.validasiMentor, MentorController.buatMentor);
router.put("/:id", ValidationMiddleware.validasiMentor, MentorController.updateMentor);
router.delete("/:id", AuthMiddleware.cekApiKey, MentorController.hapusMentor);

export default router;