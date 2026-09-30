import { Router } from "express";
import { MentorController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware } from "../middlewares";

const router = Router();

router.get("/", MentorController.getSemuaMentor);
router.get("/:id", MentorController.getMentorById);
router.post("/", AuthMiddleware.authGuard, ValidationMiddleware.validasiMentor, MentorController.buatMentor);
router.put("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasiMentor, MentorController.updateMentor);
router.delete("/:id", AuthMiddleware.authGuard, MentorController.hapusMentor);

export default router;