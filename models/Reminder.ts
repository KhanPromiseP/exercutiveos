import mongoose, { Schema, Document } from "mongoose"

export interface IReminder extends Document {
  userId: string
  title: string
  description?: string
  dueDate: Date
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReminderSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
)

ReminderSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  },
})

export default mongoose.models.Reminder || mongoose.model<IReminder>("Reminder", ReminderSchema)
