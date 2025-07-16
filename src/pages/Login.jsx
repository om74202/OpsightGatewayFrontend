import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";// adjust path as needed
import { useNavigate } from "react-router-dom";



const Login = () => {
 
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            
            if (credentials.email === "opsight@gmail.com" && credentials.password==="Opsight@123") {
               localStorage.setItem("Email",credentials.email);
               localStorage.setItem("Password",credentials.password);
                navigate("/gateway"); // or any page you want to redirect to
            } else {
                setError(  "Login failed");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
                
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome</h1>
                    <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2 text-left">
                            <label className="block text-sm font-medium text-gray-700">
                                Email Id<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 px-3 py-2 text-sm"
                                placeholder="Example@email.com"
                                value={credentials.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2 text-left">
                            <label className="block text-sm font-medium text-gray-700">
                                Password<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 px-3 py-2 text-sm"
                                placeholder="Password"
                                value={credentials.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}  

                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-500 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Sign in
                    </button>
                </form>
                {/* Footer */}
              
            </div>
        </div>
    );
};

export default Login;