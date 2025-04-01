// src/app/api/otp/route.ts
import { connectDB } from "../../../lib/mongodb"; // Your DB connection helper
import twilio from "twilio";
import crypto from "crypto";
import Otp from "../../../models/Otp"; // Import the Mongoose OTP model
import Profile from "../../../models/Profile"; // Import the Profile model
import { publishUnlockMessage } from "@/lib/mqtt";

const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);
const FROM_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

export async function POST(req: Request) {
  const {
    action,
    otp,
    profileId, // Add profileId here
  }: { action: string; otp?: string; profileId: string } = await req.json();

  // Ensure DB connection is established
  await connectDB();

  // Fetch phone number from the Profile collection using the profileId
  const profile = await Profile.findById(profileId);

  if (!profile) {
    return new Response(JSON.stringify({ error: "Profile not found" }), {
      status: 404,
    });
  }

  const phoneNumber = profile.phoneNumber;

  if (action === "generate") {
    // Generate a 6-digit OTP
    const generatedOtp = crypto.randomInt(100000, 999999).toString();

    // Store OTP and expiration in the database
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

    try {
      // Upsert the OTP document for the phoneNumber and profileId
      await Otp.findOneAndUpdate(
        { phoneNumber, profileId }, // Find by phoneNumber and profileId
        { otp: generatedOtp, expiresAt },
        { upsert: true, new: true }
      );

      // Send OTP to the user via Twilio
      await client.messages.create({
        body: `Your OTP is: ${generatedOtp}`,
        from: FROM_PHONE_NUMBER,
        to: `${phoneNumber}`, // Send OTP to the phoneNumber fetched from Profile
      });

      return new Response(
        JSON.stringify({ message: "OTP sent successfully" }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error sending OTP:", error);
      return new Response(JSON.stringify({ error: "Failed to send OTP" }), {
        status: 500,
      });
    }
  }

  if (action === "verify") {
    try {
      // Find the OTP record for the phoneNumber and profileId
      const storedOtpData = await Otp.findOne({ phoneNumber, profileId });

      if (!storedOtpData) {
        return new Response(
          JSON.stringify({
            error: "No OTP found for this phone number and profileId",
          }),
          { status: 400 }
        );
      }

      // Check if the OTP has expired
      if (Date.now() > storedOtpData.expiresAt.getTime()) {
        // Delete the expired OTP from the database
        await Otp.deleteOne({ phoneNumber, profileId });
        return new Response(JSON.stringify({ error: "OTP expired" }), {
          status: 400,
        });
      }

      // Verify the OTP
      if (storedOtpData.otp !== otp) {
        return new Response(JSON.stringify({ error: "Invalid OTP" }), {
          status: 400,
        });
      }

      // Successfully verified OTP, delete it from the database
      await Otp.deleteOne({ phoneNumber, profileId });

      // Publish the unlock message via MQTT
      publishUnlockMessage("unlock");

      return new Response(
        JSON.stringify({ message: "OTP verified successfully" }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return new Response(JSON.stringify({ error: "Failed to verify OTP" }), {
        status: 500,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Invalid request" }), {
    status: 400,
  });
}
