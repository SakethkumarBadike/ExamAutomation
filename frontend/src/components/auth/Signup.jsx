import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../axios.config";
import { FaCheckCircle } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    otp: "",
    password: ""
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSendOtp = async () => {
    setError("");
    setMessage("");
    setIsSendingOtp(true);

    try {
      await api.post("/auth/send_otp/", { email: formData.email });
      setOtpSent(true);
      setMessage("OTP sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");
    setIsVerifyingOtp(true);

    try {
      const res = await api.post("/auth/verify_otp/", {
        email: formData.email,
        otp: formData.otp
      });

      if (res.data.otp_verified) {
        setOtpVerified(true);
        setMessage("OTP verified successfully!");
      } else {
        setError("Invalid OTP");
      }
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      await api.post("/auth/signup/", {
        email: formData.email,
        password: formData.password,
        name: formData.name
      });
      navigate("/signin");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Branding */}
            <div className="md:w-1/2 hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white p-12">

        <h2 className="text-5xl font-bold mb-4">Create Your Account</h2>
        <p className="text-lg text-gray-200 text-center max-w-sm">
          Join the platform, create classrooms, and conduct proctored exams seamlessly.
        </p>
      </div>

      {/* Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 bg-white py-10">
        <div className="w-full max-w-md">
          <h3 className="text-3xl font-semibold mb-6 text-gray-800">Register</h3>

          {error && <p className="text-red-600 mb-2">{error}</p>}
          {message && <p className="text-green-600 mb-2">{message}</p>}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                College Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={otpSent}
                required
                className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@nitandhra.ac.in"
              />
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-60"
              >
                {isSendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    disabled={otpVerified}
                    required
                    className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter OTP"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={otpVerified || isVerifyingOtp}
                  className={`w-full ${
                    otpVerified ? "bg-green-600" : "bg-blue-600"
                  } text-white py-2 rounded-md hover:${
                    otpVerified ? "bg-green-700" : "bg-blue-700"
                  } transition disabled:opacity-60`}
                >
                  {otpVerified ? (
                    <span className="flex items-center justify-center">
                      <FaCheckCircle className="mr-2" /> Verified
                    </span>
                  ) : isVerifyingOtp ? (
                    "Verifying..."
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!otpVerified}
                    required
                    className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={!otpVerified}
                    required
                    className="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!otpVerified || isLoading}
                  className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-60"
                >
                  {isLoading ? "Creating Account..." : "Register"}
                </button>
              </>
            )}
          </form>

          <p className="text-sm text-gray-500 text-center mt-4">
            Already have an account?{" "}
            <a
              href="/signin"
              className="text-blue-600 hover:underline font-medium"
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
