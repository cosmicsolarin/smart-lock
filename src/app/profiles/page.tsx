"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Profiles() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [newProfileForm, setNewProfileForm] = useState<boolean>(false);
  const [editProfileId, setEditProfileId] = useState<string | null>(null); // Track which profile is being edited
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const router = useRouter();

  // Fetch profiles on component mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get("/api/profiles");
        setProfiles(response.data.profiles);
      } catch (error) {
        setError("Failed to fetch profiles.");
      }
    };
    fetchProfiles();
  }, []);

  const handleProfileClick = (profileId: string) => {
    router.push(`/profiles/${profileId}/otp`);
  };

  // Handle form submission for creating a new profile
  const handleCreateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post("/api/profiles", {
        fullName,
        phoneNumber,
      });
      setProfiles((prev) => [...prev, response.data.profile]);
      setNewProfileForm(false);
      setFullName("");
      setPhoneNumber("");
    } catch (error) {
      setError("Failed to create profile.");
    }
  };

  // Handle form submission for updating a profile
  const handleUpdateProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editProfileId) return;

    try {
      const response = await axios.put("/api/profiles", {
        profileId: editProfileId,
        fullName,
        phoneNumber,
      });
      const updatedProfile = response.data.profile;

      // Update the profile in the local state
      setProfiles((prev) =>
        prev.map((profile) =>
          profile._id === updatedProfile._id ? updatedProfile : profile
        )
      );

      // Reset form and switch off editing mode
      setEditProfileId(null);
      setFullName("");
      setPhoneNumber("");
    } catch (error) {
      setError("Failed to update profile.");
    }
  };

  // Handle profile deletion
  const handleDeleteProfile = async (profileId: string) => {
    try {
      await axios.delete("/api/profiles", {
        data: { profileId },
      });

      // Remove deleted profile from the local state
      setProfiles((prev) =>
        prev.filter((profile) => profile._id !== profileId)
      );
    } catch (error) {
      setError("Failed to delete profile.");
    }
  };

  return (
    <div className="flex flex-col gap-5 px-4 py-6 bg-gray-50 rounded-lg shadow-md max-w-3xl mx-auto w-screen h-screen">
      <h1 className="text-3xl font-semibold text-center text-gray-700">
        Your Profiles
      </h1>
      {error && <div className="text-red-500 text-center">{error}</div>}

      {/* Button to show the form for creating a new profile */}
      {!newProfileForm && !editProfileId ? (
        <button
          className="bg-blue-500 text-white p-3 rounded-md mt-4 w-full hover:bg-blue-600 transition duration-300"
          onClick={() => setNewProfileForm(true)}
        >
          Create New Profile
        </button>
      ) : (
        // Form for creating or updating a profile
        <form
          onSubmit={editProfileId ? handleUpdateProfile : handleCreateProfile}
          className="mt-6 bg-white p-5 rounded-lg shadow-lg"
        >
          <div className="flex flex-col gap-4">
            <label
              htmlFor="fullName"
              className="text-lg font-medium text-gray-600"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="border p-3 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <label
              htmlFor="phoneNumber"
              className="text-lg font-medium text-gray-600"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border p-3 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="flex gap-3 justify-between mt-4">
              <button
                type="submit"
                className="bg-green-500 text-white p-3 rounded-md hover:bg-green-600 transition duration-300 w-1/2"
              >
                {editProfileId ? "Update Profile" : "Create Profile"}
              </button>
              <button
                type="button"
                className="bg-red-500 text-white p-3 rounded-md hover:bg-red-600 transition duration-300 w-1/2"
                onClick={() => {
                  setNewProfileForm(false);
                  setEditProfileId(null);
                  setFullName("");
                  setPhoneNumber("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* List of profiles */}
      <ul className="mt-8 space-y-4">
        {profiles.map((profile) => (
          <li
            key={profile._id}
            className="p-5 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition duration-300"
          >
            <h2
              className="font-semibold text-xl text-gray-800"
              onClick={() => handleProfileClick(profile._id)}
            >
              {profile.fullName}
            </h2>
            <p className="text-gray-600">{profile.phoneNumber}</p>
            {/* Update and Delete buttons */}
            <div className="flex gap-3 mt-4 z-[100000]">
              <button
                className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600 transition duration-300 w-1/2"
                onClick={() => {
                  setEditProfileId(profile._id);
                  setFullName(profile.fullName);
                  setPhoneNumber(profile.phoneNumber);
                }}
              >
                Update
              </button>
              <button
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-300 w-1/2"
                onClick={() => handleDeleteProfile(profile._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
