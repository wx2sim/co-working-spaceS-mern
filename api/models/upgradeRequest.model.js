import mongoose from "mongoose";

const upgradeRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    speciality: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const UpgradeRequest = mongoose.model("UpgradeRequest", upgradeRequestSchema);

export default UpgradeRequest;
