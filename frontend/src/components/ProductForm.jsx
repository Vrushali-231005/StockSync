import React, { useState, useEffect } from "react";

export default function ProductForm({ product, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    totalQuantity: "",
    availableQty: "",
    image: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category || "",
        totalQuantity: product.totalQuantity || 0,
        availableQty: product.availableQty || 0,
        image: null,
      });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (formData.totalQuantity <= 0) newErrors.totalQuantity = "Total quantity must be > 0";
    if (formData.availableQty < 0) newErrors.availableQty = "Available quantity cannot be negative";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0a192f] border border-blue-400 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
          <h2 className="text-2xl font-bold text-white">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onCancel} className="text-white hover:text-gray-300">✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-white font-medium mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter product name"
              className={`w-full bg-[#112240] border ${errors.name ? "border-red-400" : "border-blue-400"} rounded-lg px-4 py-3 text-white`}
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-white font-medium mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="Enter category"
              className={`w-full bg-[#112240] border ${errors.category ? "border-red-400" : "border-blue-400"} rounded-lg px-4 py-3 text-white`}
            />
            {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-white font-medium mb-2">Description <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter product description"
              className="w-full bg-[#112240] border border-blue-400 rounded-lg px-4 py-3 text-white"
            />
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-white font-medium mb-2">Image <span className="text-red-500">*</span></label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleChange("image", e.target.files[0])}

              className="w-full bg-[#112240] border border-blue-400 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          {/* Total Quantity */}
          <div>
            <label className="block text-white font-medium mb-2">
              Total Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.totalQuantity}
              onChange={(e) => handleChange("totalQuantity", parseInt(e.target.value) || "")}
              placeholder="0"
              className={`w-full bg-[#112240] border ${errors.totalQuantity ? "border-red-400" : "border-blue-400"} rounded-lg px-4 py-3 text-white`}
            />
            {errors.totalQuantity && <p className="text-red-400 text-sm mt-1">{errors.totalQuantity}</p>}
          </div>

          {/* Available Quantity */}
          <div>
            <label className="block text-white font-medium mb-2">
              Available Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.availableQty}
              onChange={(e) => handleChange("availableQty", parseInt(e.target.value) || "")}
              placeholder="0"
              className={`w-full bg-[#112240] border ${errors.availableQty ? "border-red-400" : "border-blue-400"} rounded-lg px-4 py-3 text-white`}
            />
            {errors.availableQty && <p className="text-red-400 text-sm mt-1">{errors.availableQty}</p>}
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-[#112240] border border-blue-400 rounded-lg text-white hover:bg-[#15305a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg text-white ${isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50"}`}
            >
              {isLoading ? "Saving..." : product ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
