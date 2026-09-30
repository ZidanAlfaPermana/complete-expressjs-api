import { Router } from "express";
import { AuthController } from "../controllers";
import { ValidationMiddleware } from "../middlewares";

const router = Router();

router.post("/register", ValidationMiddleware.validasiRegister, AuthController.register);
router.post("/login", ValidationMiddleware.validasiLogin, AuthController.login);

export default router;