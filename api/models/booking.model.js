import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  features: {
    type: Array,
    default: [],
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'stripe'],
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  }
}, { timestamps: true });

bookingSchema.index({ user: 1 });
bookingSchema.index({ listing: 1 });
bookingSchema.index({ owner: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
