import { Router } from "express";
import { AuthController } from "../controllers";
import { validasi } from "../middlewares/validasi.middleware";
import {loginLimiter} from "../middlewares/rateLimit.middleware";
import {LoginDto/*, RefreshTokenDto*/, RegisterDto} from "../dto/auth.dto";

const router = Router();

// src/routes/auth.routes.ts
router.post("/register", validasi(RegisterDto), AuthController.register);
router.post("/login", loginLimiter, validasi(LoginDto), AuthController.login);
router.post("/refresh"/*, validasi(RefreshTokenDto)*/, AuthController.refresh);
router.post("/logout"/*, validasi(LogoutTokenDto)*/, AuthController.logout);

export default router;