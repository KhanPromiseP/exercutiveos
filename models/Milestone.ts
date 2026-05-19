import mongoose, { Schema, Document } from "mongoose"

export interface IMilestone extends Document {
  projectId: string
  userId: string
  title: string
  description?: string
  dueDate?: Date
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const MilestoneSchema: Schema = new Schema(
  {
    projectId: { type: String, required: true },
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  },
  { timestamps: true }
)

MilestoneSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  },
})

export default mongoose.models.Milestone || mongoose.model<IMilestone>("Milestone", MilestoneSchema)
