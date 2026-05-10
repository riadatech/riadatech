import mongoose from "mongoose";

const SummaryItemSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    distanceKm: Number,
    monthlyRent: Number,
    sizeSqm: Number,
    level: String,
    score: Number,
    reason: String,
    lat: Number,
    lng: Number,
  },
  {
    _id: false,
  }
);

const MapAnalysisSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    businessCategory: {
      type: String,
      required: true,
      trim: true,
    },
    customBusinessCategory: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    targetAudience: {
      type: String,
      required: true,
      trim: true,
    },
    estimatedBudget: {
      type: Number,
      required: true,
    },
    maxMonthlyRent: {
      type: Number,
      required: true,
    },
    searchRadiusKm: {
      type: Number,
      required: true,
    },
    areaName: {
      type: String,
      trim: true,
      default: "",
    },
    selectedLocation: {
      lat: Number,
      lng: Number,
      label: String,
      city: String,
    },
    competitorSummary: {
      count: Number,
      level: String,
      items: [SummaryItemSchema],
    },
    rentalSummary: {
      totalAvailable: Number,
      withinBudget: Number,
      suitabilityLabel: String,
      bestOptions: [SummaryItemSchema],
    },
    engagementSummary: {
      level: String,
      score: Number,
      densityCount: Number,
      highlights: [String],
    },
    accessibilitySummary: {
      level: String,
      score: Number,
      highlights: [String],
    },
    scores: {
      competition: Number,
      rent: Number,
      engagement: Number,
      accessibility: Number,
    },
    locationScore: Number,
    rating: String,
    recommendation: String,
    alternatives: [SummaryItemSchema],
  },
  {
    timestamps: true,
  }
);

const MapAnalysisModel = mongoose.model("mapAnalyses", MapAnalysisSchema);

export default MapAnalysisModel;
