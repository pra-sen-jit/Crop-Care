import mongoose, { Schema, Document } from 'mongoose'

export interface IShareableReport extends Document {
  disease: string
  confidence: number
  severity: string
  treatment: string
  prevention: string
  imageUrl: string
  createdAt: Date
  expiresAt: Date
}

const ShareableReportSchema = new Schema<IShareableReport>({
  disease: { type: String, required: true },
  confidence: { type: Number, required: true },
  severity: { type: String, required: true },
  treatment: { type: String, required: true },
  prevention: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
})

// Index for automatic cleanup of expired reports
ShareableReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.ShareableReport || mongoose.model<IShareableReport>('ShareableReport', ShareableReportSchema)