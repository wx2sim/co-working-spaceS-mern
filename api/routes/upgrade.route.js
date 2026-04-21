import express from "express";
import { verifyUserToken, checkVerification } from "../utils/verifyUser.js";
import { requireRole } from "../utils/verifyRole.js";
import {
  createUpgradeRequest,
  getMyUpgradeStatus,
  getPendingRequests,
  approveRequest,
  denyRequest,
  cancelUpgradeRequest,
} from "../controllers/upgrade.controller.js";

const router = express.Router();

// Client routes
router.post("/request", verifyUserToken, checkVerification, createUpgradeRequest);
router.get("/my-status", verifyUserToken, getMyUpgradeStatus);
router.delete("/cancel-request", verifyUserToken, cancelUpgradeRequest);

// Admin routes
router.get("/pending", verifyUserToken, checkVerification, requireRole(["admin", "superadmin"]), getPendingRequests);
router.post("/approve/:id", verifyUserToken, checkVerification, requireRole(["admin", "superadmin"]), approveRequest);
router.post("/deny/:id", verifyUserToken, checkVerification, requireRole(["admin", "superadmin"]), denyRequest);

export default router;
