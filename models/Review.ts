import mongoose, { Schema, Document } from "mongoose"
import { ReviewType } from "@/lib/types"

export interface IReview extends Document {
  userId: string
  type: ReviewType
  date: Date
  accomplishments: string[]
  challenges: string[]
  priorities: string[]
  reflections?: string
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
    date: { type: Date, required: true },
    accomplishments: [{ type: String }],
    challenges: [{ type: String }],
    priorities: [{ type: String }],
    reflections: { type: String },
  },
  { timestamps: true }
)

ReviewSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  },
})

export default mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema)
