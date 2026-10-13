import { Router } from "express";
import { MentorController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware } from "../middlewares";
import {MentorDto} from "../dto/mentor.dto";

const router = Router();

router.get("/", MentorController.getSemuaMentor);
router.get("/:id", MentorController.getMentorById);
router.post("/", AuthMiddleware.authGuard, ValidationMiddleware.validasi(MentorDto), MentorController.buatMentor);
router.put("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasi(MentorDto), MentorController.updateMentor);
router.delete("/:id", AuthMiddleware.authGuard, MentorController.hapusMentor);

export default router;