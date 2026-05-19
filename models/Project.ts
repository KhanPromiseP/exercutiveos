import mongoose, { Schema, Document } from "mongoose"
import { ProjectStatus, Priority } from "@/lib/types"

export interface IProject extends Document {
  userId: string
  title: string
  vision?: string
  mission?: string
  category: string
  tags: string[]
  status: ProjectStatus
  priority: Priority
  deadline?: Date
  progress: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    vision: { type: String },
    mission: { type: String },
    category: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ["active", "completed", "on-hold", "archived"], default: "active" },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    deadline: { type: Date },
    progress: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
)

ProjectSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  },
})

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema)
