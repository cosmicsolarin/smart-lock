// src/models/Otp.ts
import mongoose, { Schema, Document } from "mongoose";

interface IOtp extends Document {
  phoneNumber: string;
  otp: string;
  expiresAt: Date;
  profileId: mongoose.Types.ObjectId; // Add profileId here
}

const otpSchema = new Schema<IOtp>({
  phoneNumber: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile", // Assuming you have a Profile model to reference
    required: true,
  },
});

const Otp = mongoose.models.Otp || mongoose.model<IOtp>("Otp", otpSchema);

export default Otp;
