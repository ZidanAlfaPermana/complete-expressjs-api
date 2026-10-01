import { Router } from "express";
import { JurnalController } from "./../controllers";
import { ValidationMiddleware, AuthMiddleware, RoleMiddleware } from "../middlewares"

const router = Router();

router.get("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), JurnalController.getSemuaJurnal);
router.get("/with_peserta", JurnalController.getJurnalDenganPeserta);
router.get("/saya", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor", "peserta"), JurnalController.getJurnalSaya);
router.get("/:id", JurnalController.getJurnalById);
router.patch("/:id/review", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), RoleMiddleware.requireRole("mentor"), JurnalController.updateStatusReview);
router.post("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor", "peserta"),ValidationMiddleware.validasiJurnal, JurnalController.buatJurnal);
router.put("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasiJurnal, JurnalController.updateJurnal);
router.delete("/:id", AuthMiddleware.authGuard, JurnalController.hapusJurnal);

export default router;