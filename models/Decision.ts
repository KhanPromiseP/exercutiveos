import mongoose, { Schema, Document } from "mongoose"
import { DecisionStatus } from "@/lib/types"

export interface IDecision extends Document {
  userId: string
  projectId?: string
  title: string
  description: string
  reasoning: string
  expectedOutcome: string
  actualOutcome?: string
  status: DecisionStatus
  reviewDate?: Date
  createdAt: Date
  updatedAt: Date
}

const DecisionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    projectId: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    reasoning: { type: String, required: true },
    expectedOutcome: { type: String, required: true },
    actualOutcome: { type: String },
    status: { type: String, enum: ["pending", "implemented", "reviewing", "revised"], default: "pending" },
    reviewDate: { type: Date },
  },
  { timestamps: true }
)

DecisionSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  },
})

export default mongoose.models.Decision || mongoose.model<IDecision>("Decision", DecisionSchema)
