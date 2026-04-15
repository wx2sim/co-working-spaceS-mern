import express from "express";
import { verifyUserToken } from "../utils/verifyUser.js";
import { requireRole } from "../utils/verifyRole.js";
import {
  createUpgradeRequest,
  getMyUpgradeStatus,
  getPendingRequests,
  approveRequest,
  denyRequest,
} from "../controllers/upgrade.controller.js";

const router = express.Router();

// Client routes
router.post("/request", verifyUserToken, createUpgradeRequest);
router.get("/my-status", verifyUserToken, getMyUpgradeStatus);

// Admin routes
router.get("/pending", verifyUserToken, requireRole(["admin", "superadmin"]), getPendingRequests);
router.post("/approve/:id", verifyUserToken, requireRole(["admin", "superadmin"]), approveRequest);
router.post("/deny/:id", verifyUserToken, requireRole(["admin", "superadmin"]), denyRequest);

export default router;
