import mongoose, { Schema, Document } from "mongoose"
import { HabitLog } from "@/lib/types"

export interface IHabit extends Document {
  userId: string
  lifeDomainId?: string
  name: string
  description?: string
  frequency: "daily" | "weekly" | "monthly"
  targetPerPeriod: number
  currentStreak: number
  longestStreak: number
  logs: HabitLog[]
  createdAt: Date
  updatedAt: Date
}

const HabitLogSchema = new Schema({
  date: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { _id: false })

const HabitSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    lifeDomainId: { type: String },
    name: { type: String, required: true },
    description: { type: String },
    frequency: { type: String, enum: ["daily", "weekly", "monthly"], default: "daily" },
    targetPerPeriod: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    logs: [HabitLogSchema]
  },
  { timestamps: true }
)

HabitSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  },
})

export default mongoose.models.Habit || mongoose.model<IHabit>("Habit", HabitSchema)
