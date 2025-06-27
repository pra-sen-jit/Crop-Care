import mongoose, { Schema, Document } from 'mongoose'

export interface IDiseasePrediction extends Document {
  userId: mongoose.Types.ObjectId;
  disease: string;
  confidence: number;
  severity: string;
  treatment: string;
  prevention: string;
  imageUrl: string;
  createdAt: Date;
}

const DiseasePredictionSchema = new Schema<IDiseasePrediction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  disease: { type: String, required: true },
  confidence: { type: Number, required: true },
  severity: { type: String, required: true },
  treatment: { type: String, required: true },
  prevention: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.DiseasePrediction || mongoose.model<IDiseasePrediction>('DiseasePrediction', DiseasePredictionSchema) 