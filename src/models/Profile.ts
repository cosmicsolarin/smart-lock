import mongoose, { Schema, model } from "mongoose";

// Define the Profile schema
export interface ProfileDocument {
  _id: string;
  userId: mongoose.Schema.Types.ObjectId; // Use ObjectId type for the reference
  fullName: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<ProfileDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User's ObjectId
      ref: "User", // Link to User model
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Profile =
  mongoose.models?.Profile || model<ProfileDocument>("Profile", ProfileSchema);
export default Profile;
