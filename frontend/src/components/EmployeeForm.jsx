import React, { useState, useEffect } from "react";
import { X, Copy } from "lucide-react";
import { generatePassword } from "../../utils/passwordGenerator";
import { BASE_URL } from "../../utils/passwordGenerator";

export default function EmployeeForm({ employee, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    department: employee?.department || "",
    deskNumber: employee?.deskNumber || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    age: employee?.age || "",
    gender: employee?.gender || "",
    password: employee?.password || "", // only for new employees
    role: employee?.role || "employee",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Auto-generate password for new employees when name + deskNumber are entered
  useEffect(() => {
    if (!employee && formData.name && formData.deskNumber) {
      setFormData((prev) => ({
        ...prev,
        password: generatePassword(formData.name, formData.deskNumber),
      }));
    }
  }, [formData.name, formData.deskNumber, employee]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (!formData.deskNumber.trim()) newErrors.deskNumber = "Desk Number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formData.password);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const method = employee ? "PUT" : "POST";
      const url = employee
        ? `${BASE_URL}/api/employees/${employee._id}/edit`
        : `${BASE_URL}/api/employees/add`;

      const payload = {
        ...formData,
        deskNumber: formData.deskNumber.startsWith("D-")
          ? formData.deskNumber
          : `D-${formData.deskNumber}`,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save employee");

      // ✅ Always extract the employee object
      const responseData = await res.json();
      const savedEmployee = responseData.employee || responseData;

      // Pass it to parent along with type
      onSubmit(savedEmployee, employee ? "update" : "add");
    } catch (err) {
      console.error(err);
      onSubmit(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0a192f] border border-blue-400 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
          <h2 className="text-2xl font-bold text-white">
            {employee ? "Edit Employee" : "Add Employee"}
          </h2>
          <button onClick={onCancel} className="text-white hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Name", field: "name", type: "text", required: true },
            { label: "Department", field: "department", type: "text", required: true },
            { label: "Desk Number", field: "deskNumber", type: "text", required: true },
            { label: "Email", field: "email", type: "email", required: true },
            { label: "Phone", field: "phone", type: "text", required: true },
            { label: "Age", field: "age", type: "number", required: true },
          ].map(({ label, field, type, required }) => (
            <div key={field}>
              <label className="block text-white font-medium mb-2">
                {label} {required && <span className="text-red-500">*</span>}
              </label>

              {field === "deskNumber" ? (
                <div className="flex">
                  <span className="bg-cyan-500/20 text-cyan-300 px-3 py-3 rounded-l-lg border border-blue-400">
                    D-
                  </span>
                  <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    className={`w-full bg-[#112240] border ${
                      errors[field] ? "border-red-400" : "border-blue-400"
                    } rounded-r-lg px-4 py-3 text-white`}
                  />
                </div>
              ) : (
                <input
                  type={type}
                  value={formData[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={`w-full bg-[#112240] border ${
                    errors[field] ? "border-red-400" : "border-blue-400"
                  } rounded-lg px-4 py-3 text-white`}
                />
              )}

              {errors[field] && (
                <p className="text-red-400 text-sm mt-1">{errors[field]}</p>
              )}
            </div>
          ))}

          {/* Gender */}
          <div>
            <label className="block text-white font-medium mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="w-full bg-[#112240] border border-blue-400 rounded-lg px-4 py-3 text-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Password (read-only for new employee) */}
          {!employee && (
            <div className="col-span-2 relative">
              <label className="block text-white font-medium mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.password}
                readOnly
                className="w-full bg-[#112240] border border-blue-400 rounded-lg px-4 py-3 text-white pr-12"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="absolute right-2 top-[38px] text-white hover:text-gray-300"
              >
                <Copy className="w-5 h-5" />
              </button>
              {copySuccess && (
                <span className="absolute right-10 top-[38px] text-green-400 text-sm">
                  Copied!
                </span>
              )}
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-white font-medium mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full bg-[#112240] border border-blue-400 rounded-lg px-4 py-3 text-white"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </form>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
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
            onClick={handleSubmit}
            className={`px-6 py-3 rounded-lg text-white ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/50"
            }`}
          >
            {isLoading ? "Saving..." : employee ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
