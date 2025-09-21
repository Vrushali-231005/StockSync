"use client";
import React, { useState, useEffect } from "react";
import { Package, Send, ArrowBigLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InventoryRequestForm() {
  const navigate = useNavigate();
  const [availableInventory, setAvailableInventory] = useState([]);
  const [formData, setFormData] = useState({
    employeeName: "",
    deskNumber: "",
    inventoryName: "",
    quantity: 1,
    reason: "",
    requestType: "new",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState(null);

  useEffect(() => {
    // Auto-fill employee name from localStorage
    const storedName = localStorage.getItem("name");
    const storedDesk = localStorage.getItem("deskNumber"); // optional, if you saved desk number
    setFormData(prev => ({
      ...prev,
      employeeName: storedName || "",
      deskNumber: storedDesk || ""
    }));

    const fetchInventory = async () => {
      try {
        const invRes = await fetch("/api/inventory?page=1&limit=999");
        const invData = await invRes.json();
        setAvailableInventory(invData.data || []);
      } catch (err) {
        console.error("Error loading inventory", err);
        setSubmitMessage({
          type: "error",
          message: "Failed to load inventory",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employeeName) newErrors.employeeName = "Employee name missing.";
    if (!formData.deskNumber) newErrors.deskNumber = "Desk number is required.";
    if (!formData.inventoryName) newErrors.inventoryName = "Please select an inventory item.";
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0.";
    if (!formData.reason.trim()) newErrors.reason = "Reason for request is required.";
    if (!formData.requestType) newErrors.requestType = "Please select a request type.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    setSubmitMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);
    if (!validateForm()) {
      setSubmitMessage({ type: "error", message: "Please correct the errors in the form." });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/inventoryReq/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit request.");
      }

      setSubmitMessage({
        type: "success",
        message: "Inventory request submitted successfully!",
      });
      setFormData({
        ...formData,
        inventoryName: "",
        quantity: 1,
        reason: "",
        requestType: "new",
      });
    } catch (err) {
      setSubmitMessage({
        type: "error",
        message: err.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a192f] px-6 py-6">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-700 pb-4 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            StockSync
          </h1>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Inventory Request</h2>
          <p className="text-gray-400 text-sm">Request new or exchange items</p>
        </div>
        <div className="w-12" />
      </header>

      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-[#112240] hover:bg-[#15305a] text-white px-4 py-2 rounded-lg border border-blue-400 transition-all"
        >
          <ArrowBigLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Request Form */}
      <div className="max-w-3xl mx-auto bg-[#0b1d35]/80 border border-blue-400 rounded-2xl p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1 - Employee Name & Desk Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Employee <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.employeeName}
                readOnly
                className="w-full bg-[#112240] border border-blue-400 rounded-lg px-4 py-3 text-white cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Desk Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.deskNumber}
                onChange={(e) => handleChange("deskNumber", e.target.value)}
                className="w-full bg-[#112240] border border-blue-400 rounded-lg px-4 py-3 text-white"
              />
              {errors.deskNumber && (
                <p className="text-red-400 text-sm mt-1">{errors.deskNumber}</p>
              )}
            </div>
          </div>

          {/* Row 2 - Inventory Name & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">
                Inventory Item <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.inventoryName}
                onChange={(e) => handleChange("inventoryName", e.target.value)}
                className="w-full bg-[#112240] border border-blue-400 rounded-lg px-4 py-3 text-white"
                disabled={submitting || loading}
              >
                <option value="">Select an inventory item</option>
                {availableInventory.map((item, idx) => (
                  <option key={idx} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              {errors.inventoryName && (
                <p className="text-red-400 text-sm mt-1">{errors.inventoryName}</p>
              )}
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", Number(e.target.value))}
                min="1"
                className="w-full bg-[#112240] border border-blue-400 rounded-lg px-4 py-3 text-white"
                disabled={submitting}
              />
              {errors.quantity && (
                <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-white font-medium mb-2">
              Reason for Request <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              rows={4}
              className="w-full bg-[#112240] border border-blue-400 rounded-lg px-4 py-3 text-white"
              disabled={submitting}
            />
            {errors.reason && (
              <p className="text-red-400 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-white font-medium mb-2">
              Request Type <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="radio"
                  value="new"
                  checked={formData.requestType === "new"}
                  onChange={(e) => handleChange("requestType", e.target.value)}
                  className="form-radio h-5 w-5 text-blue-500 bg-[#112240] border-blue-400"
                />
                <span className="ml-2">New</span>
              </label>
              <label className="flex items-center text-white cursor-pointer">
                <input
                  type="radio"
                  value="exchange"
                  checked={formData.requestType === "exchange"}
                  onChange={(e) => handleChange("requestType", e.target.value)}
                  className="form-radio h-5 w-5 text-blue-500 bg-[#112240] border-blue-400"
                />
                <span className="ml-2">Exchange</span>
              </label>
            </div>
            {errors.requestType && (
              <p className="text-red-400 text-sm mt-1">{errors.requestType}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50 transition-shadow duration-300 text-white px-6 py-3 rounded-lg flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Submitting Request...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Request
              </>
            )}
          </button>

          {/* Message */}
          {submitMessage && (
            <div
              className={`mt-4 p-3 rounded-lg text-center relative ${
                submitMessage.type === "success"
                  ? "bg-green-900/50 text-green-300"
                  : "bg-red-900/50 text-red-300"
              }`}
            >
              {submitMessage.message}
              <button
                onClick={() => setSubmitMessage(null)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
