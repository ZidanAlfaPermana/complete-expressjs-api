import { Router } from "express";
import { JurnalController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware, RoleMiddleware } from "../middlewares";
import {CreateJurnalDto, ListJurnalQueryDto, ReviewJurnalDto, UpdateJurnalDto} from "../dto/jurnal.dto";
import {IdParamDto} from "../dto/common.dto";

const router = Router();

router.use(AuthMiddleware.authGuard);

router.get("/me", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor", "peserta"), JurnalController.getJurnalSaya);
router.get("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(ListJurnalQueryDto, "query"), JurnalController.getSemuaJurnal);
router.get("/peserta", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), JurnalController.getJurnalDenganPeserta);

router.get("/:id", ValidationMiddleware.validasi(IdParamDto, "params"), JurnalController.getJurnalById);
router.post("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor", "peserta"), ValidationMiddleware.validasi(CreateJurnalDto), JurnalController.buatJurnal);
router.put("/:id", ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(UpdateJurnalDto), JurnalController.updateJurnal);
router.patch("/:id/review", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), ValidationMiddleware.validasi(IdParamDto, "params"), ValidationMiddleware.validasi(ReviewJurnalDto), JurnalController.updateReviewJurnal);
router.delete("/:id", ValidationMiddleware.validasi(IdParamDto, "params"), JurnalController.hapusJurnal);

export default router;