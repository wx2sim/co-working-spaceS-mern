import mongoose from "mongoose";


const listingSchema = new mongoose.Schema(
    {
        name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      default: 'property', // 'property' or 'service'
    },
    bathrooms: {
      type: Number,
      required: false,
    },
    confirencerooms: {
      type: Number,
      required: false,
    },
    rooms: {
      type: Number,
      required: false,
    },
    availableRooms: {
      type: Number,
      required: false,
    },
    furnished: {
      type: Boolean,
      required: false,
    },
    parking: {
      type: Boolean,
      required: false,
    },
    type: {
      type: String,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

listingSchema.index({ userRef: 1 });
listingSchema.index({ type: 1 });
listingSchema.index({ offer: 1 });

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;