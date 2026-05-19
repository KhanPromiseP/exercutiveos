import mongoose, { Schema, Document } from "mongoose"
import { CaptureType } from "@/lib/types"

export interface IQuickCapture extends Document {
  userId: string
  type: CaptureType
  content: string
  processed: boolean
  processedAt?: Date
  createdAt: Date
}

const QuickCaptureSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: ["idea", "task", "reminder", "note", "goal"], required: true },
    content: { type: String, required: true },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

QuickCaptureSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  },
})

export default mongoose.models.QuickCapture || mongoose.model<IQuickCapture>("QuickCapture", QuickCaptureSchema)
