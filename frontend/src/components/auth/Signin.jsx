import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import api from "../../../axios.config";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false); 
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); 
        setError(""); 

        try {
            const response = await api.post("/auth/login/", formData);
            Cookies.set("access_token", response.data.access, { expires: 1 }); // 1 day expiry
            Cookies.set("refresh_token", response.data.refresh, { expires: 7 }); // 7 days expiry
            login(response.data.role, response.data.id);
            navigate('/'); 
        } catch (error) {
            setError("Invalid Credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">
                    Login
                </h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-600">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                            placeholder="Enter your email"
                            disabled={isLoading}
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
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                        <div className="text-right mt-1">
                            <a 
                                href="/forgot-password" 
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Forgot Password?
                            </a>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                    <p className="text-center text-gray-600 mt-4">
                        No Account? <a href="/signup/" className="text-indigo-500 hover:underline">Register</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;