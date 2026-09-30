import { Router } from "express";
import { JurnalController } from "./../controllers";
import { ValidationMiddleware, AuthMiddleware } from "../middlewares/index"

const router = Router();

router.get("/", AuthMiddleware.authGuard, JurnalController.getSemuaJurnal);
router.get("/with_peserta", JurnalController.getJurnalDenganPeserta);
router.get("/saya", AuthMiddleware.authGuard, JurnalController.getJurnalSaya);
router.get("/:id", JurnalController.getJurnalById);
router.patch("/:id/review", AuthMiddleware.authGuard, JurnalController.updateStatusReview);
router.post("/", AuthMiddleware.authGuard, ValidationMiddleware.validasiJurnal, JurnalController.buatJurnal);
router.put("/:id", AuthMiddleware.authGuard, ValidationMiddleware.validasiJurnal, JurnalController.updateJurnal);
router.delete("/:id", AuthMiddleware.authGuard, JurnalController.hapusJurnal);

export default router;