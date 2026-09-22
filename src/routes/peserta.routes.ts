import { Router } from "express";
import { PesertaController, JurnalController } from "./../controllers";
import { ValidationMiddleware, AuthMiddleware } from "../middlewares/index";

const router = Router();

router.get("/", PesertaController.getSemuaPeserta);
router.get("/:id", PesertaController.getPesertaById);
router.get("/:id/jurnal", JurnalController.getJurnalPesertaById);
router.post("/", ValidationMiddleware.validasiPeserta, PesertaController.buatPeserta);
router.put("/:id", ValidationMiddleware.validasiPeserta, PesertaController.updatePeserta);
router.delete("/:id", AuthMiddleware.cekApiKey, PesertaController.hapusPeserta);

export default router;