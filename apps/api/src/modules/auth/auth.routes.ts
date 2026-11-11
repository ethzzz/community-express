import { Router } from 'express';
import { asyncHandler } from "../../common/middleware.ts";
import { loginHandler, logoutHandler, refreshHandler, registerHandle } from "./auth.controller.ts";

export const authRouter = Router();
authRouter.post('/register', registerHandle);
authRouter.post('/login', loginHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/refresh', refreshHandler);
