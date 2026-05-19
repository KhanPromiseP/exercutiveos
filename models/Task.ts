import mongoose, { Schema, Document } from "mongoose"
import { TaskStatus, Priority, ChecklistItem } from "@/lib/types"

export interface ITask extends Document {
  userId: string
  projectId?: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: Date
  reminderDate?: Date
  isRecurring: boolean
  recurringPattern?: string
  checklist: ChecklistItem[]
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

const ChecklistItemSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
})

const TaskSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    projectId: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["pending", "in-progress", "completed", "blocked", "delayed"], default: "pending" },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    dueDate: { type: Date },
    reminderDate: { type: Date },
    isRecurring: { type: Boolean, default: false },
    recurringPattern: { type: String },
    checklist: [ChecklistItemSchema],
    completedAt: { type: Date }
  },
  { timestamps: true }
)

TaskSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  },
})

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema)
