import { Router } from "express";
import { AuthController } from "../controllers";
import { ValidationMiddleware } from "../middlewares";
import { RateLimit } from "../middlewares"

const router = Router();

router.post("/register", ValidationMiddleware.validasiRegister, AuthController.register);
router.post("/login", RateLimit.loginLimiter, ValidationMiddleware.validasiLogin, AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

export default router;