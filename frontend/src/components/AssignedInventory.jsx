import React, { useEffect, useState } from "react";
import { ArrowLeft, Package, Search, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AssignedInventory() {
  const [assignedItems, setAssignedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  const employeeId =
    typeof window !== "undefined" ? localStorage.getItem("id") : null;
  const employeeName =
    typeof window !== "undefined" ? localStorage.getItem("name") : null;

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(
          `http://localhost:5757/api/employees/${employeeId}/assigned-inventory`
        );
        if (!res.ok) throw new Error("Failed to fetch inventory");
        const data = await res.json();
        setAssignedItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (employeeId) fetchInventory();
  }, [employeeId]);

  const filteredItems = assignedItems.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = assignedItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  return (
    <div className="min-h-screen w-full bg-[#0a192f] px-6 py-6">
      {/* Header */}
      <header className="relative border-b border-slate-700 pb-4 mb-8 flex items-center">
        <div className="flex items-center space-x-3 absolute left-0">
         <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                     <Package className="w-6 h-6 text-white" />
                   </div>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            StockSync
          </h1>
        </div>

        <div className="mx-auto text-center">
          <h2 className="text-3xl font-bold text-white">Assigned Inventory</h2>
          <p className="text-gray-400 text-sm">
            Items assigned to {employeeName || "you"}
          </p>
        </div>
      </header>

     {/* Back + Search */}
<div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
  <button
    onClick={() => navigate(-1)}
    className="flex items-center gap-2 bg-[#112240] hover:bg-[#15305a] text-white px-4 py-2 rounded-lg border border-blue-400 transition-all"
  >
    <ArrowLeft className="w-5 h-5" />
    Back
  </button>
  </div>

  <div className="flex-1 min-w-[250px]">
    <div className="bg-[#112240] border border-blue-400/30 rounded-xl p-4 shadow-lg mt-2 mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search item..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0b1b33] border border-blue-400/30 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>
    </div>
  </div>

      {loading ? (
        <div className="text-center text-gray-300 p-10">Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-700">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-white">
              No inventory assigned
            </h3>
            <p className="text-gray-400">
              {searchTerm
                ? "No items match your search"
                : "Items will appear here when assigned to you"}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#112240] border border-blue-400 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition cursor-pointer"
            >
              <div className="h-32 w-full overflow-hidden">
                <img
                  src={
                    item.image
                      ? `http://localhost:5757/${item.image}`
                      : "/inventory-item.png"
                  }
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <h4 className="text-white font-semibold text-lg">
                  {item.name}
                </h4>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {item.description}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm">
                    Qty: {item.quantity}
                  </span>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
