import { Router } from "express";
import { JurnalController } from "../controllers";
import { ValidationMiddleware, AuthMiddleware, RoleMiddleware } from "../middlewares";

const router = Router();

router.use(AuthMiddleware.authGuard);

router.get("/saya", RoleMiddleware.requireRole("mentor", "peserta"), JurnalController.getJurnalSaya);
router.get("/", RoleMiddleware.requireRole("mentor"), JurnalController.getSemuaJurnal);
router.get("/peserta", RoleMiddleware.requireRole("mentor"), JurnalController.getJurnalDenganPeserta);

router.get("/:id", JurnalController.getJurnalById);
router.post("/", RoleMiddleware.requireRole("mentor", "peserta"), ValidationMiddleware.validasiJurnal, JurnalController.buatJurnal);
router.put("/:id", ValidationMiddleware.validasiJurnal, JurnalController.updateJurnal);
router.patch("/:id/review", RoleMiddleware.requireRole("mentor"), JurnalController.updateStatusReview);
router.delete("/:id", JurnalController.hapusJurnal);

export default router;