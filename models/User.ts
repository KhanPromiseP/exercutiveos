import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  id: string
  email: string
  name: string
  image?: string
  password?: string // Only for credentials provider
  emailVerified: boolean
  verificationToken?: string
  pushSubscriptions?: any[] // Web Push subscriptions
  preferences?: {
    theme?: string
    compactMode?: boolean
    animations?: boolean
    twoFactor?: boolean
    sessionTimeout?: boolean
    pushNotifications?: boolean
    emailDigests?: boolean
    taskReminders?: boolean
    habitReminders?: boolean
    offlineMode?: boolean
    backgroundSync?: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { type: String },
    password: { type: String }, // Hashed password
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    pushSubscriptions: [{ type: Schema.Types.Mixed }], // Array of Web Push subscription objects
    preferences: {
      theme: { type: String, default: "system" },
      compactMode: { type: Boolean, default: false },
      animations: { type: Boolean, default: true },
      twoFactor: { type: Boolean, default: false },
      sessionTimeout: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      emailDigests: { type: Boolean, default: false },
      taskReminders: { type: Boolean, default: true },
      habitReminders: { type: Boolean, default: true },
      offlineMode: { type: Boolean, default: true },
      backgroundSync: { type: Boolean, default: true },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)