import express from "express";
import { loginController, profileController, registerController, verifyEmailController } from "../controllers/user.controller.js";
import verifyToken from "../middlewares/verifyToken.middle.js";

const userRoutes = express.Router();

userRoutes.post('/register', registerController);

userRoutes.post('/login', loginController);

userRoutes.get('/verify-email', verifyEmailController);

userRoutes.get('/profile', verifyToken, profileController);

export default userRoutes;