"use client";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Users, UserCheck, ClipboardCheck, LogOut } from "lucide-react";

export default function StockSyncHero() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const roleFromStorage = localStorage.getItem("role");
    const nameFromStorage = localStorage.getItem("name");

    if (roleFromStorage) setRole(roleFromStorage);
    else navigate("/");

    if (nameFromStorage) setName(nameFromStorage);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Buttons for Admin
  const adminButtons = [
    {
      to: "/products",
      className: "bg-cyan-600 hover:bg-cyan-500 border-cyan-400 hover:border-cyan-300",
      icon: <Package className="w-8 h-8 mr-3" />,
      text: "My Products",
    },
    {
      to: "/req-management",
      className: "bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-400 hover:border-fuchsia-300",
      icon: <ClipboardCheck className="w-8 h-8 mr-3" />,
      text: "Request Management",
    },
    {
      to: "/employees",
      className: "bg-indigo-600 hover:bg-indigo-500 border-indigo-400 hover:border-indigo-300",
      icon: <Users className="w-8 h-8 mr-3" />,
      text: "My Employees",
    },
  ];

  // Buttons for Employee
  const employeeButtons = [
    {
      to: "/manage-products",
      className: "bg-blue-600 hover:bg-blue-500 border-blue-400 hover:border-blue-300",
      icon: <ClipboardCheck className="w-8 h-8 mr-3" />,
      text: "Request Inventory",
    },
    {
      to: "/assigned-inventory",
      className: "bg-green-600 hover:bg-green-500 border-green-400 hover:border-green-300",
      icon: <UserCheck className="w-8 h-8 mr-3" />,
      text: "Assigned Inventory",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 relative">
      {/* Top-right: Hello + Logout */}
      {name && (
        <div className="absolute top-5 right-5 flex items-center gap-4 z-20">
          <span className="text-white font-medium">Hello, {name}!</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-6 lg:p-8">
        <div className="flex items-center space-x-3">
          <div className="w-13 h-13 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            StockSync
          </h1>
        </div>

      
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 lg:px-8 py-2">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-3 gap-8 items-center mb-16">
          {/* Left Side - Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Streamline Your
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {" "}
                  Inventory
                </span>
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Take control of your inventory with StockSync - the comprehensive management system that helps you
                track products, manage stock levels, and coordinate your team efficiently.
              </p>
            </div>

            <div className="space-y-3 text-gray-300">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Real-time inventory tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Advanced analytics and reporting</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Team collaboration tools</span>
              </div>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="lg:col-span-1 relative">
            <div className="bg-slate-800/50 rounded-2xl p-4 border border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
              <img
                src="/StockSync.png"
                alt="StockSync Dashboard Preview"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Role-Based Action Buttons */}
        <div className="bg-slate-800/50 rounded-2xl p-8 border border-blue-400 flex flex-col sm:flex-row gap-8 justify-center items-center">
          {(role === "admin" ? adminButtons : employeeButtons).map((btn, i) => (
            <Link
              key={i}
              to={btn.to}
              className={`w-full sm:w-64 h-[80px] flex items-center justify-center px-8 text-xl font-bold rounded-xl border-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ease-in-out text-white ${btn.className}`}
            >
              {btn.icon}
              {btn.text}
            </Link>
          ))}
        </div>

        {/* About Section */}
        <section className="mt-20 py-16 bg-slate-800/30 rounded-2xl border border-blue-400">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-6xl font-bold text-white leading-tight">
                About
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> StockSync</span>
              </h2>
              <p className="text-xl text-gray-300 py-2 max-w-3xl mx-auto">
                Your comprehensive solution for modern inventory management
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[ 
                { icon: <Package className="w-6 h-6 text-white" />, title: "Product Management", desc: "Efficiently track and manage your entire product catalog with real-time updates and detailed analytics.", bg: "bg-blue-600" },
                { icon: <UserCheck className="w-6 h-6 text-white" />, title: "Employee Asset Allocation", desc: "Always know who’s using what. Assign laptops, accessories, and track allocations with location & usage logs.", bg: "bg-purple-600" },
                { icon: <ClipboardCheck className="w-6 h-6 text-white" />, title: "Quick Asset Requests", desc: "Empower your team to request devices instantly. With built-in approvals and reasons, stay organized and efficient.", bg: "bg-indigo-600" }
              ].map((card, idx) => (
                <div key={idx} className="bg-slate-700/50 p-6 rounded-xl border border-slate-600">
                  <div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center mb-4`}>
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{card.title}</h3>
                  <p className="text-gray-300">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Why Choose Section */}
            <div className="mt-12 bg-slate-700/30 p-8 rounded-xl border border-slate-600">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Why Choose StockSync?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  ["Real-time Tracking", "Monitor your inventory levels in real-time with instant updates", "bg-blue-400"],
                  ["Advanced Analytics", "Get detailed insights and reports to make informed decisions", "bg-purple-400"],
                  ["User-Friendly Interface", "Intuitive design that makes inventory management effortless", "bg-indigo-400"],
                  ["Scalable Solution", "Grows with your business from small startups to large enterprises", "bg-blue-400"],
                  ["Secure & Reliable", "Enterprise-grade security to protect your valuable data", "bg-purple-400"],
                  ["24/7 Support", "Round-the-clock customer support to help you succeed", "bg-indigo-400"],
                ].map(([title, desc, dot], idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 ${dot} rounded-full mt-2`}></div>
                      <div>
                        <h4 className="text-white font-semibold">{title}</h4>
                        <p className="text-gray-300 text-sm">{desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
