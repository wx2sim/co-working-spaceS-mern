import UpgradeRequest from "../models/upgradeRequest.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";

// Client creates an upgrade request
export const createUpgradeRequest = async (req, res, next) => {
  try {
    const { fullName, businessName, speciality, phoneNumber } = req.body;

    // Check if user already has a pending request
    const existingRequest = await UpgradeRequest.findOne({
      userId: req.user.id,
      status: "pending",
    });

    if (existingRequest) {
      return next(errorHandler(400, "You already have a pending upgrade request."));
    }

    const newRequest = await UpgradeRequest.create({
      userId: req.user.id,
      fullName,
      businessName,
      speciality,
      phoneNumber,
    });

    res.status(201).json(newRequest);
  } catch (error) {
    next(error);
  }
};

// Client checks their own upgrade request status
export const getMyUpgradeStatus = async (req, res, next) => {
  try {
    const request = await UpgradeRequest.findOne({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    if (!request) {
      return res.status(200).json({ status: "none" });
    }

    res.status(200).json({ status: request.status, request });
  } catch (error) {
    next(error);
  }
};

// Admin gets all pending upgrade requests
export const getPendingRequests = async (req, res, next) => {
  try {
    const requests = await UpgradeRequest.find({ status: "pending" })
      .populate("userId", "username email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

// Admin approves an upgrade request
export const approveRequest = async (req, res, next) => {
  try {
    const request = await UpgradeRequest.findById(req.params.id);
    if (!request) return next(errorHandler(404, "Request not found."));
    if (request.status !== "pending")
      return next(errorHandler(400, "This request has already been processed."));

    // Update the request status
    request.status = "approved";
    await request.save();

    // Update the user's role from client to user
    await User.findByIdAndUpdate(request.userId, { role: "user" });

    res.status(200).json({ message: "Request approved. User upgraded to seller." });
  } catch (error) {
    next(error);
  }
};

// Admin denies an upgrade request
export const denyRequest = async (req, res, next) => {
  try {
    const request = await UpgradeRequest.findById(req.params.id);
    if (!request) return next(errorHandler(404, "Request not found."));
    if (request.status !== "pending")
      return next(errorHandler(400, "This request has already been processed."));

    request.status = "denied";
    await request.save();

    res.status(200).json({ message: "Request denied." });
  } catch (error) {
    next(error);
  }
};
