import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL } from "../../utils/passwordGenerator"

export default function AssignInventoryModal({ employee, onClose }) {
  const [availableInventory, setAvailableInventory] = useState([]);
  const [assignedInventory, setAssignedInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [assignQuantity, setAssignQuantity] = useState(1);
  const [flashMessage, setFlashMessage] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Fetch available inventory
  const fetchAvailableInventory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/inventory?page=1&limit=999`);
      const data = await res.json();
      setAvailableInventory(data.data || []);
    } catch {
      setFlashMessage({ message: "Failed to load available inventory.", type: "error" });
    }
  };

  // Fetch assigned inventory
  const fetchAssignedInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/employees/${employee._id}/assigned-inventory`);
      const data = await res.json();
      setAssignedInventory(data || []);
    } catch {
      setFlashMessage({ message: "Failed to load assigned inventory.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableInventory();
    fetchAssignedInventory();
  }, [employee._id]);

  // Assign new inventory
  const handleAssignInventory = async (e) => {
    e.preventDefault();
    if (!selectedInventoryId || assignQuantity <= 0) {
      setFlashMessage({ message: "Please select an item and valid quantity.", type: "error" });
      return;
    }

    setAssignLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/employees/${employee._id}/assigned-inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId: selectedInventoryId, quantity: assignQuantity }),
      });

      if (!res.ok) throw new Error();
      setFlashMessage({ message: "Inventory assigned successfully!", type: "success" });
      await fetchAssignedInventory();
      setSelectedInventoryId("");
      setAssignQuantity(1);
    } catch {
      setFlashMessage({ message: "Failed to assign inventory.", type: "error" });
    } finally {
      setAssignLoading(false);
    }
  };

  // Show confirmation popup for remove
  const handleRemoveAssignedInventory = (inventoryId) => {
    setFlashMessage({
      message: "Do you want to remove this inventory?",
      type: "confirm",
      inventoryId,
    });
  };

  // Remove one quantity
  const removeOne = async (inventoryId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/employees/${employee._id}/assigned-inventory/${inventoryId}?reduce=1`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setFlashMessage({ message: "Reduced quantity by 1!", type: "success" });
      fetchAssignedInventory();
    } catch {
      setFlashMessage({ message: "Failed to reduce quantity.", type: "error" });
    }
  };

  // Remove all quantity
  const removeAll = async (inventoryId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/api/employees/${employee._id}/assigned-inventory/${inventoryId}?all=true`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      setFlashMessage({ message: "Removed all quantities!", type: "success" });
      fetchAssignedInventory();
    } catch {
      setFlashMessage({ message: "Failed to remove all.", type: "error" });
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = assignedInventory.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(assignedInventory.length / itemsPerPage);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#112240] border border-blue-400 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Flash Message */}
        {flashMessage && flashMessage.type === "confirm" ? (
          <div className="p-3 text-center bg-blue-500/20 text-blue-300 flex items-center justify-center gap-4">
            <span>{flashMessage.message}</span>
            <div className="flex gap-2">
              <button
                onClick={() => removeOne(flashMessage.inventoryId)}
                className="border border-blue-400 text-blue-400 hover:bg-blue-500/20 px-3 py-1 rounded text-sm"
              >
                Remove One
              </button>
              <button
                onClick={() => removeAll(flashMessage.inventoryId)}
                className="border border-red-400/40 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded text-sm"
              >
                Remove All
              </button>
            </div>
          </div>
        ) : flashMessage ? (
          <div
            className={`p-3 text-center rounded ${{
              error: "bg-red-500/20 text-red-400",
              warning: "bg-yellow-500/20 text-yellow-400",
              success: "bg-green-500/20 text-green-400"
            }[flashMessage.type]}`}
          >
            {flashMessage.message}
          </div>
        ) : null}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-400">
          <h2 className="text-2xl font-bold text-white">
            Assign Inventory to {employee.name}
          </h2>
          <button
            onClick={onClose}
            className="border border-blue-400 text-blue-400 hover:bg-blue-500/20 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-6">
          {/* Assign Form */}
          <div className="md:col-span-1 bg-[#0b1b33] rounded-xl border border-blue-400 p-4 space-y-4">
            <h3 className="text-xl font-semibold text-white mb-4">Assign New Item</h3>
            <form onSubmit={handleAssignInventory} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Inventory Item</label>
                <select
                  value={selectedInventoryId}
                  onChange={(e) => setSelectedInventoryId(e.target.value)}
                  className="w-full bg-[#0b1b33] border border-blue-400 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an item</option>
                  {availableInventory.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  value={assignQuantity}
                  onChange={(e) => setAssignQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-full bg-[#0b1b33] border border-blue-400 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={assignLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {assignLoading ? "Assigning..." : "Assign Inventory"}
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Assigned Inventory Table */}
          <div className="md:col-span-2 bg-[#0b1b33] rounded-xl border border-blue-400 p-4">
            <h3 className="text-xl font-semibold text-white mb-4">Currently Assigned</h3>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-300 ml-3">Loading...</p>
              </div>
            ) : assignedInventory.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No inventory assigned yet.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0b1b33] border-b border-blue-400">
                      <tr>
                        <th className="text-left py-3 px-4 text-white">Item</th>
                        <th className="text-left py-3 px-4 text-white">Image</th>
                        <th className="text-left py-3 px-4 text-white">Quantity</th>
                        <th className="text-center py-3 px-4 text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((item, index) => (
                        <tr
                          key={item.inventoryId} // must use inventoryId
                          className={`border-b border-blue-400 ${
                            index % 2 === 0 ? "bg-[#112240]/60" : "bg-[#112240]/30"
                          } hover:bg-slate-800 transition`}
                        >
                          <td className="py-3 px-4 text-white">{item.name}</td>
                          <td className="py-3 px-4">
                            <img
                              src={item.image ? `${BASE_URL}/${item.image}` : "/placeholder.svg"}
                              alt={item.name}
                              className="w-10 h-10 rounded-md object-cover bg-slate-600"
                            />
                          </td>
                          <td className="py-3 px-4 text-cyan-300 font-medium">{item.quantity}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleRemoveAssignedInventory(item.inventoryId)}
                              className="border border-red-400/40 text-red-400 hover:bg-red-500/20 p-2 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="px-3 py-1 border border-blue-400 text-blue-400 hover:bg-blue-500/20 rounded disabled:opacity-30"
                    >
                      <ChevronLeft />
                    </button>
                    <span className="text-white px-2 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="px-3 py-1 border border-blue-400 text-blue-400 hover:bg-blue-500/20 rounded disabled:opacity-30"
                    >
                      <ChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
