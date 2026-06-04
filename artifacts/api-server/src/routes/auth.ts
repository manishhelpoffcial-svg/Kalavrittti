import { Router } from "express";
import { requireAuth } from "../middlewares/supabase-auth";

const router = Router();

router.get("/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.authUser });
});

export default router;
