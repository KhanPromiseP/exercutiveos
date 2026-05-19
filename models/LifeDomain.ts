import mongoose, { Schema, Document } from "mongoose"

export interface ILifeDomain extends Document {
  userId: string
  name: string
  description?: string
  icon: string
  color: string
  vision?: string
  goals: string[]
  createdAt: Date
  updatedAt: Date
}

const LifeDomainSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    vision: { type: String },
    goals: [{ type: String }],
  },
  { timestamps: true }
)

LifeDomainSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  },
})

export default mongoose.models.LifeDomain || mongoose.model<ILifeDomain>("LifeDomain", LifeDomainSchema)
