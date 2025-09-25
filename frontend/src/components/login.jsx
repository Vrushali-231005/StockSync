import React, { useState } from "react";
import { Package, Eye, EyeOff } from "lucide-react";
import { BASE_URL } from "../../utils/passwordGenerator"

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${BASE_URL}/api/employees/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      // Store info in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.employee.role);
      localStorage.setItem("name", data.employee.name);
      localStorage.setItem("deskNumber",data.employee.deskNumber);
      localStorage.setItem("id", data.employee.id);

      setSuccess("Login successful! Welcome " + data.employee.name);

      // Redirect after short delay
      setTimeout(() => {
        if (data.employee.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/employee-dashboard";
        }
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background image */}
      <img
        src="https://res.cloudinary.com/drkhfntxp/image/upload/v1758466285/StockSync_zmpd7y.png"
        alt="StockSync"
        className="absolute inset-0 w-full h-full object-cover opacity-50 blur-md"
      />

      <div className="relative z-10 w-full max-w-md bg-[#0a192f] border-2 border-blue-500 p-10 rounded-3xl shadow-2xl backdrop-blur-xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Package className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          StockSync
        </h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {success && <p className="text-green-400 text-center mb-4">{success}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-[#112240] border-2 border-blue-400 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
          />

          {/* Password with toggle */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#112240] border-2 border-blue-400 rounded-xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-300 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-32 mx-auto px-4 py-2 mt-2 rounded-xl text-white font-bold ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/50"
            } transition-all duration-300`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
