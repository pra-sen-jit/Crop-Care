import mongoose, { Schema, Document } from 'mongoose'

export interface ICropRecommendation extends Document {
  userId: mongoose.Types.ObjectId;
  crop: string;
  suitability: string;
  profit: string;
  expected_yield: string;
  best_season: string;
  why_recommended: string[];
  createdAt: Date;
}

const CropRecommendationSchema = new Schema<ICropRecommendation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  crop: { type: String, required: true },
  suitability: { type: String },
  profit: { type: String },
  expected_yield: { type: String },
  best_season: { type: String },
  why_recommended: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.CropRecommendation || mongoose.model<ICropRecommendation>('CropRecommendation', CropRecommendationSchema) 