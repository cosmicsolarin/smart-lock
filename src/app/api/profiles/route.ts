import { connectDB } from "../../../lib/mongodb";
import Profile from "../../../models/Profile";
import User from "../../../models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// POST request handler (Profile creation)
export async function POST(req: Request) {
  const session = await getServerSession(req); // Ensure the user is authenticated
  if (!session || !session.user || !session.user.email) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { fullName, phoneNumber } = await req.json();
  console.log("Request body:", { fullName, phoneNumber });

  // Ensure DB connection is established
  await connectDB();

  try {
    // Find the user by email to get the corresponding ObjectId
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Create a new profile associated with the user's ObjectId
    const newProfile = new Profile({
      userId: user._id, // Use the ObjectId from the User model
      fullName,
      phoneNumber,
    });
    await newProfile.save();

    return new NextResponse(
      JSON.stringify({
        message: "Profile created successfully",
        profile: newProfile,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating profile:", error); // Log the error for debugging
    return new NextResponse(
      JSON.stringify({ error: "Failed to create profile" }),
      { status: 500 }
    );
  }
}

// GET request handler (Fetch profiles)
export async function GET(req: Request) {
  const session = await getServerSession(req); // Ensure the user is authenticated
  if (!session || !session.user || !session.user.email) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Ensure DB connection is established
  await connectDB();

  try {
    // Find the user by email to get the corresponding ObjectId
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Find the profiles associated with the logged-in user's ObjectId
    const profiles = await Profile.find({ userId: user._id });

    if (profiles.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "No profiles found" }),
        { status: 404 }
      );
    }

    return new NextResponse(JSON.stringify({ profiles }), { status: 200 });
  } catch (error) {
    console.error("Error fetching profiles:", error); // Log the error for debugging
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch profiles" }),
      { status: 500 }
    );
  }
}

// PUT request handler (Update profile)
export async function PUT(req: Request) {
  const session = await getServerSession(req); // Ensure the user is authenticated
  if (!session || !session.user || !session.user.email) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { profileId, fullName, phoneNumber } = await req.json();
  console.log("Request body:", { profileId, fullName, phoneNumber });

  // Ensure DB connection is established
  await connectDB();

  try {
    // Find the user by email to get the corresponding ObjectId
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Find the profile by its ID and ensure it belongs to the logged-in user
    const profile = await Profile.findOne({ _id: profileId, userId: user._id });
    if (!profile) {
      return new NextResponse(
        JSON.stringify({ error: "Profile not found or unauthorized" }),
        { status: 404 }
      );
    }

    // Update the profile fields
    profile.fullName = fullName || profile.fullName;
    profile.phoneNumber = phoneNumber || profile.phoneNumber;
    await profile.save();

    return new NextResponse(
      JSON.stringify({
        message: "Profile updated successfully",
        profile,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error); // Log the error for debugging
    return new NextResponse(
      JSON.stringify({ error: "Failed to update profile" }),
      { status: 500 }
    );
  }
}

// DELETE request handler (Delete profile)
export async function DELETE(req: Request) {
  const session = await getServerSession(req); // Ensure the user is authenticated
  if (!session || !session.user || !session.user.email) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const { profileId } = await req.json();
  console.log("Request body:", { profileId });

  // Ensure DB connection is established
  await connectDB();

  try {
    // Find the user by email to get the corresponding ObjectId
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    // Find the profile by its ID and ensure it belongs to the logged-in user
    const profile = await Profile.findOne({ _id: profileId, userId: user._id });
    if (!profile) {
      return new NextResponse(
        JSON.stringify({ error: "Profile not found or unauthorized" }),
        { status: 404 }
      );
    }

    // Delete the profile
    await profile.deleteOne();

    return new NextResponse(
      JSON.stringify({ message: "Profile deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting profile:", error); // Log the error for debugging
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete profile" }),
      { status: 500 }
    );
  }
}
