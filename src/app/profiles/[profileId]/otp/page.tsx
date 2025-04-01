"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const OtpPage = ({ params }: { params: { profileId: string } }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state for async actions
  const router = useRouter();

  // Handle OTP generation
  const handleGenerateOtp = async () => {
    setLoading(true);
    try {
      // Send request to backend to generate OTP with profileId and action in body
      const response = await axios.post(`/api/otp`, {
        profileId: params.profileId,
        action: "generate", // Indicate action as "generate"
      });
      if (response.status === 200) {
        setOtpSent(true);
        setError(""); // Clear previous errors
      }
    } catch (error) {
      setError("Failed to generate OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      // Send OTP and profileId in request body for verification
      const response = await axios.post(`/api/otp`, {
        profileId: params.profileId,
        otp,
        action: "verify", // Indicate action as "verify"
      });

      if (response.status === 200) {
        setOtpVerified(true);
        setError(""); // Clear previous errors
        // Redirect to success page after successful OTP verification
        // setTimeout(() => {
        //   router.push("/success");
        // }, 1000); // Add delay for the user to see the "OTP Verified!" message
      }
    } catch (error) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-lg shadow-md text-black">
      <h1 className="text-2xl font-semibold text-center">OTP Verification</h1>
      <div className="mt-4 text-center">
        {!otpSent ? (
          <>
            <button
              onClick={handleGenerateOtp}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
              disabled={loading}
            >
              {loading ? "Generating OTP..." : "Generate OTP"}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="mt-4 border p-3 rounded-md w-full"
              disabled={loading}
            />
            <button
              onClick={handleVerifyOtp}
              className="bg-green-500 text-white py-2 px-4 rounded-md mt-4 hover:bg-green-600 transition duration-300 w-full"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {otpVerified && (
          <p className="text-green-500 mt-2">OTP Verified! Redirecting...</p>
        )}
      </div>
    </div>
  );
};

export default OtpPage;
