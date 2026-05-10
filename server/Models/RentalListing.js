import mongoose from "mongoose";

const RentalListingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    neighborhood: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    monthlyRent: {
      type: Number,
      required: true,
      min: 0,
    },
    sizeSqm: {
      type: Number,
      min: 0,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    businessCategories: {
      type: [String],
      default: [],
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

RentalListingSchema.index({ location: "2dsphere" });

const RentalListingModel = mongoose.model("rentalListings", RentalListingSchema);

export default RentalListingModel;
