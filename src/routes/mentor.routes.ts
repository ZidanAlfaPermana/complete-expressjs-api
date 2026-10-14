import { Router } from "express";
import { MentorController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware } from "../middlewares";
import {MentorDto} from "../dto/mentor.dto";
import {IdParamDto} from "../dto/common.dto";

const router = Router();

router.get("/", MentorController.getSemuaMentor);
router.get("/:id", ValidationMiddleware.validasi(IdParamDto, "params"), MentorController.getMentorById);
router.post("/", AuthMiddleware.authGuard, ValidationMiddleware.validasi(MentorDto), MentorController.buatMentor);
router.put("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(MentorDto), MentorController.updateMentor);
router.delete("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasi(IdParamDto, "params"), MentorController.hapusMentor);

export default router;