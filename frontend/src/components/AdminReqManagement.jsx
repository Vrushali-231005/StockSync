import React, { useState, useEffect } from "react";
import {
  Package,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  ArrowBigLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import FlashMessage from "./FlashMessage"; // Your FlashMessage component
import { BASE_URL } from "../../utils/passwordGenerator";

export default function AdminRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [flash, setFlash] = useState({ message: "", type: "", buttons: null });
  const itemsPerPage = 6;
  const navigate = useNavigate();

  const fetchRequests = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/inventoryReq`);
      if (!res.ok) throw new Error("Failed to fetch requests");

      const allRequests = await res.json();

      allRequests.sort(
        (a, b) =>
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );

      setTotalPages(Math.ceil(allRequests.length / itemsPerPage));
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setRequests(allRequests.slice(startIndex, endIndex));
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || "Error fetching requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(1);
  }, []);

  // Approve / Reject confirmation using flash
  const handleStatusUpdate = (id, status) => {
    setFlash({
      message: `Are you sure you want to ${status} this request?`,
      type: "info",
      buttons: (
        <>
          <button
            onClick={async () => {
              setFlash({ message: "", type: "" });
              setLoading(true);
              try {
                const res = await fetch(`${BASE_URL}/api/inventoryReq/${id}/status`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status }),
                });
                if (!res.ok) throw new Error(`Failed to ${status} request`);
                await fetchRequests(currentPage);
                setFlash({ message: `✅ Request ${status} successfully!`, type: "success" });
              } catch (err) {
                setFlash({ message: `❌ Failed to ${status} request`, type: "error" });
              } finally {
                setLoading(false);
              }
            }}
            className="mr-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md"
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

  // Delete request with flash
  const handleDeleteRequest = (id) => {
    setFlash({
      message: "Are you sure you want to delete this request?",
      type: "info",
      buttons: (
        <>
          <button
            onClick={async () => {
              setFlash({ message: "", type: "" });
              setLoading(true);
              try {
                const res = await fetch(`${BASE_URL}/api/inventoryReq/${id}`, {
                  method: "DELETE",
                });
                if (!res.ok) throw new Error("Failed to delete request");
                if (requests.length === 1 && currentPage > 1) {
                  await fetchRequests(currentPage - 1);
                } else {
                  await fetchRequests(currentPage);
                }
                setFlash({ message: "✅ Request deleted successfully!", type: "success" });
              } catch (err) {
                setFlash({ message: "❌ Failed to delete request", type: "error" });
              } finally {
                setLoading(false);
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

  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-900/50 text-yellow-300 border border-yellow-700";
      case "approved":
        return "bg-green-900/50 text-green-300 border border-green-700";
      case "rejected":
        return "bg-red-900/50 text-red-300 border border-red-700";
      default:
        return "bg-gray-700/50 text-gray-300 border border-gray-600";
    }
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
    <h2 className="text-3xl font-bold text-white">Manage Requests</h2>
    <p className="text-gray-400 text-sm">Review and Manage Inventory Request</p>
  </div>
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

      {/* Table */}
      <div className="bg-[#112240] border border-blue-400 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center text-gray-300 p-10">Loading...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-400">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-gray-300">No requests found</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-[#0b1b33] border-b border-blue-400">
                <tr>
                  {[
                    "Employee",
                    "Desk Number",
                    "Item",
                    "Type",
                    "Reason",
                    "Status",
                    "Requested At",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="text-left p-4 text-white font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req._id}
                    className="border-b border-slate-700 hover:bg-slate-800 transition-colors duration-200"
                  >
                    <td className="p-4 text-white">{req.employee?.name || "N/A"}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-md font-medium shadow-sm">
                        {req.employee?.deskNumber || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{req.inventory?.name || "N/A"}</td>
                    <td className="p-4 text-gray-300 capitalize">{req.requestType}</td>
                    <td className="p-4 text-gray-300 truncate max-w-xs">{req.reason}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusClasses(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
                    </td>
                    <td className="p-4 flex gap-2">
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(req._id, "approved")}
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(req._id, "rejected")}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteRequest(req._id)}
                        className="text-red-400 hover:bg-red-500/20 p-2 rounded-md border border-red-400/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-4 p-6">
                <button
                  onClick={() => fetchRequests(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  <ChevronLeft />
                </button>
                <span className="text-white px-2 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => fetchRequests(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
