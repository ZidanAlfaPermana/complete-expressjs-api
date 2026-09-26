import { Router } from "express";
import { JurnalController } from "./../controllers";
import { ValidationMiddleware, AuthMiddleware } from "../middlewares/index"

const router = Router();

router.get("/", JurnalController.getSemuaJurnal);
router.get("/with_peserta", JurnalController.getJurnalDenganPeserta);
router.get("/:id", JurnalController.getJurnalById);
router.patch("/:id/review", JurnalController.updateStatusReview);
router.post("/", ValidationMiddleware.validasiJurnal, JurnalController.buatJurnal);
router.put("/:id", ValidationMiddleware.validasiJurnal, JurnalController.updateJurnal);
router.delete("/:id", AuthMiddleware.cekApiKey, JurnalController.hapusJurnal);

export default router;