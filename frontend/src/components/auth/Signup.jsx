import React, { useState } from "react";
import axios from "axios";
import api from "../../../axios.config";
import { useNavigate } from "react-router-dom";
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async () => {
        setError(""); 
        setMessage("");
        setIsSendingOtp(true);

        // if (!formData.email.endsWith("@nitandhra.ac.in")) {
        //     setError("Only @nitandhra.ac.in emails are allowed");
        //     setIsSendingOtp(false);
        //     return;
        // }

        try {
            await api.post("/auth/send_otp/", { email: formData.email });
            setOtpSent(true);
            setMessage("OTP sent to your email");
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
                name: formData.name,
            });
            navigate("/signin"); // Redirect to login page after successful registration
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
                    Register
                </h2>

                {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}
                {message && <p className="text-green-500 text-sm text-center mb-2">{message}</p>}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-gray-600">College Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            placeholder="user@nitandhra.ac.in"
                            disabled={otpSent || isLoading}
                        />
                    </div>

                    {!otpSent ? (
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 ${isSendingOtp ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                        </button>
                    ) : (
                        <>
                            <div>
                                <label className="block text-gray-600">OTP Code</label>
                                <input
                                    type="text"
                                    name="otp"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    placeholder="Enter 6-digit OTP"
                                    disabled={otpVerified || isLoading}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otpVerified || isVerifyingOtp || isLoading}
                                className={`w-full ${otpVerified ? 'bg-green-500' : 'bg-blue-500'} text-white py-2 rounded-lg hover:${otpVerified ? 'bg-green-600' : 'bg-blue-600'} transition duration-300 ${(isVerifyingOtp || isLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                                <label className="block text-gray-600">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    placeholder="Your full name"
                                    disabled={!otpVerified || isLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-600">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    placeholder="Create password"
                                    disabled={!otpVerified || isLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!otpVerified || isLoading}
                                className={`w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-300 ${(!otpVerified || isLoading) ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? "Creating Account..." : "Register"}
                            </button>
                        </>
                    )}

                    <p className="text-center text-gray-600 mt-4">
                        Already registered?{" "}
                        <a href="/signin" className="text-indigo-500 hover:underline">
                            Login here
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;