import React, { useState, useEffect } from "react";
import {
  
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  ArrowBigLeft,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import EmployeeForm from "./EmployeeForm";
import { useNavigate } from "react-router-dom";
import FlashMessage from "./FlashMessage";
import AssignInventoryModal from "./AssignInventoryModel";
import { BASE_URL } from "../../utils/passwordGenerator"

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [flash, setFlash] = useState({ message: "", type: "", buttons: null });
  const [showAssignInventoryModal, setShowAssignInventoryModal] = useState(false);
  const [selectedEmployeeForInventory, setSelectedEmployeeForInventory] = useState(null);

  // Pagination states
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const navigate = useNavigate();

  // Fetch employees with pagination
  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    try {
  const res = await fetch(
    `${BASE_URL}/api/employees?page=${page}&limit=${itemsPerPage}&search=${searchTerm}`
  );
  const data = await res.json();

  // 🚫 filter out admins
  const nonAdmins = (data.employees || []).filter(
    (emp) => emp.role !== "admin"
  );

  setEmployees(nonAdmins);
  setTotalPages(data.totalPages || 1);
  setCurrentPage(data.currentPage || 1);
} catch (err) {
  console.error("Error fetching employees:", err);
  setFlash({ message: "❌ Failed to load employees", type: "error" });
} finally {
  setLoading(false);
}
  };

  useEffect(() => {
    fetchEmployees(1);
  }, [searchTerm]);

  // Delete employee
  const handleDeleteEmployee = (id) => {
    setFlash({
      message: "Are you sure you want to delete this employee?",
      type: "info",
      buttons: (
        <>
          <button
            onClick={async () => {
              try {
                const res = await fetch(`${BASE_URL}/api/employees/${id}/deleteEmp`, { method: "DELETE" });
                if (res.ok) {
                  fetchEmployees(currentPage);
                  setFlash({ message: "✅ Employee deleted successfully!", type: "success" });
                } else {
                  setFlash({ message: "❌ Failed to delete employee", type: "error" });
                }
              } catch (err) {
                console.error("Error deleting employee:", err);
                setFlash({ message: "❌ Failed to delete employee", type: "error" });
              }
            }}
            className="mr-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Yes
          </button>
          <button
            onClick={() => setFlash({ message: "", type: "" })}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            No
          </button>
        </>
      ),
    });
  };

  // Add button
  const handleAddClick = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  // Edit button
  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  // Form submit
  const handleFormSubmit = async (success) => {
    if (success) {
      await fetchEmployees(currentPage);
      setShowForm(false);
      setEditingEmployee(null);
      setFlash({ message: "✅ Employee added successfully! Email Sent!", type: "success" });
    } else {
      setFlash({ message: "❌ Failed to save employee", type: "error" });
    }
  };

  const openAssignInventory = (employee) => {
    setSelectedEmployeeForInventory(employee);
    setShowAssignInventoryModal(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#0a192f] px-6 py-6">
      {/* Flash Message */}
      {flash.message && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          customButtons={flash.buttons}
          onClose={() => setFlash({ message: "", type: "" })}
        />
      )}

      {/* Header */}
      <header className="relative border-b border-slate-700 pb-4 mb-8 flex items-center">
  {/* Left Logo */}
  <div className="flex items-center space-x-3 absolute left-0">
    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
      StockSync
    </h1>
  </div>

  {/* Center Title */}
  <div className="mx-auto text-center">
    <h2 className="text-3xl font-bold text-white">My Employee's</h2>
    <p className="text-gray-400 text-sm">Manage Employeees and Assigned Inventory</p>
  </div>
</header>

      {/* Back + Add Employee */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
           className="flex items-center gap-2 bg-[#112240] hover:bg-[#15305a] text-white px-4 py-2 rounded-lg border border-blue-400 transition-all"
                  >
          <ArrowBigLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleAddClick}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 hover:opacity-90 transition"
        >
          <Plus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#112240] border border-blue-400/30 rounded-xl p-6 mb-8 shadow-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0b1b33] border border-blue-400/30 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#112240] border border-blue-400 rounded-2xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="text-center text-gray-300 p-10">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="text-center text-gray-300 p-10">No employees found</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-[#0b1b33] border-b border-blue-400/30">
                <tr>
                  <th className="text-left p-4 text-white">Name</th>
                  <th className="text-left p-4 text-white">Department</th>
                  <th className="text-left p-4 text-white">Desk</th>
                  <th className="text-left p-4 text-white">Email</th>
                  <th className="text-left p-4 text-white">Contact No.</th>
                  <th className="text-left p-4 text-white">Age</th>
                  <th className="text-left p-4 text-white">Gender</th>
                  <th className="text-center p-4 text-white">Assigned Inventory</th>
                  <th className="text-center p-4 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="border-b border-blue-400/10 hover:bg-slate-800 transition-colors duration-200"
                  >
                    <td className="p-4 font-medium text-white pl-3">{emp.name}</td>
                    <td className="p-4 text-gray-300">{emp.department}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-md font-medium shadow-sm">
                        {emp.deskNumber}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{emp.email}</td>
                    <td className="p-4 text-gray-300">{emp.phone}</td>
                    <td className="p-4 text-gray-300">{emp.age}</td>
                    <td className="p-4 text-gray-300">{emp.gender}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => openAssignInventory(emp)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:opacity-90 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View ({emp.assignedInventory?.length || 0})
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="text-blue-400 hover:bg-blue-500/20 p-2 rounded-md border border-blue-400/40"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp._id)}
                          className="text-red-400 hover:bg-red-500/20 p-2 rounded-md border border-red-400/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 p-6">
                <button
                  onClick={() => fetchEmployees(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border border-blue-400/40 text-blue-400 hover:bg-blue-500/20 px-4 py-2 rounded-md disabled:opacity-30 transition"
                >
                  <ChevronLeft />
                </button>
                <span className="text-white px-2 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchEmployees(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border border-blue-400/40 text-blue-400 hover:bg-blue-500/20 px-4 py-2 rounded-md disabled:opacity-30 transition"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Forms */}
      {showForm && (
        <EmployeeForm
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          employee={editingEmployee}
        />
      )}
      {showAssignInventoryModal && selectedEmployeeForInventory && (
        <AssignInventoryModal
          employee={selectedEmployeeForInventory}
          onClose={() => setShowAssignInventoryModal(false)}
        />
      )}
    </div>
  );
}
