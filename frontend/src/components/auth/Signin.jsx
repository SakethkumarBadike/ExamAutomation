import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "../../../axios.config";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login, user } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        console.log("User in Login component:", user);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await api.post("/auth/login/", formData);
            Cookies.set("access_token", response.data.access, { expires: 1 });
            Cookies.set("refresh_token", response.data.refresh, { expires: 7 });
            login(response.data.role, response.data.id);
            navigate("/");
        } catch (error) {
            setError("Invalid credentials. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left: Branding */}
            <div className="md:w-1/2 hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white p-12">
                <h1 className="text-5xl font-bold mb-4 tracking-tight drop-shadow-lg">
                    Welcome Back!
                </h1>
                <p className="text-lg text-gray-300 max-w-md text-center">
                    Log in to manage your classes, monitor progress, and host exams effortlessly.
                </p>
            </div>

            {/* Right: Form */}
            <div className="w-full md:w-1/2 flex justify-center items-center bg-white p-8">
                <div className="w-full max-w-md space-y-6">
                    <div>
                        <h2 className="text-3xl font-semibold text-gray-800">Sign In</h2>
                        <p className="text-sm text-gray-500 mt-1">Access your dashboard</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-md">
                            {error}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                            />
                            <div className="text-right mt-1">
                                <a
                                    href="/forgot-password"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-4">
                        Don’t have an account?{" "}
                        <a href="/signup/" className="text-blue-600 hover:underline">
                            Register
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
