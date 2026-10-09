import { Router } from "express";
import { JurnalController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware, RoleMiddleware } from "../middlewares";

const router = Router();

router.use(AuthMiddleware.authGuard);

router.get("/me", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor", "peserta"), JurnalController.getJurnalSaya);
router.get("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), JurnalController.getSemuaJurnal);
router.get("/peserta", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), JurnalController.getJurnalDenganPeserta);

router.get("/:id", JurnalController.getJurnalById);
router.post("/", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor", "peserta"), ValidationMiddleware.validasiJurnal, JurnalController.buatJurnal);
router.put("/:id", ValidationMiddleware.validasiJurnal, JurnalController.updateJurnal);
router.patch("/:id/review", AuthMiddleware.authGuard, RoleMiddleware.requireRole("mentor"), JurnalController.updateStatusReview);
router.delete("/:id", JurnalController.hapusJurnal);

export default router;