import React, { useState, useEffect } from "react";
import {
  UserCircle,
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowBigLeft,
} from "lucide-react";
import ProductForm from "./ProductForm";
import FlashMessage from "./FlashMessage";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../utils/passwordGenerator"

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [flash, setFlash] = useState({ message: "", type: "", buttons: null });
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();
  const itemsPerPage = 6;

  // Fetch products with pagination
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/inventory?page=${page}&limit=${itemsPerPage}`);
      const data = await res.json();
      setProducts(data.data);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.error("Error fetching inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  // Add product
  const handleAddProduct = async (formDataObj) => {
    try {
      const formData = new FormData();
      formData.append("name", formDataObj.name);
      formData.append("description", formDataObj.description);
      formData.append("category", formDataObj.category);
      formData.append("totalQuantity", formDataObj.totalQuantity);
      formData.append("availableQty", formDataObj.availableQty);
      if (formDataObj.image) {
        formData.append("image", formDataObj.image);
      }

      const res = await fetch(`${BASE_URL}/api/inventory/add`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to add product");

      await res.json();
      setFlash({ message: "✅ Product added successfully!", type: "success" });
      fetchProducts();
      setShowForm(false);
    } catch (err) {
      console.error("Error:", err);
      setFlash({ message: "❌ Error saving product", type: "error" });
    }
  };

  // Edit product
  const handleEditProduct = async (data) => {
    if (!editingProduct) return;
    setFormLoading(true);

    const updatedData = {
      name: data.name,
      availableQty: data.availableQty,
      totalQuantity: data.totalQuantity,
      description: data.description,
      category: data.category,
    };

    if (data.image) {
      updatedData.image = data.image;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/inventory/${editingProduct._id}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        setFlash({ message: "✅ Product updated!", type: "success" });
        setEditingProduct(null);
        fetchProducts(currentPage);
      }
    } catch (err) {
      setFlash({ message: "❌ Failed to update product", type: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  // Confirm delete product
  const confirmDeleteProduct = (id) => {
  setFlash({
    message: "Are you sure you want to delete this product?",
    type: "info",
    buttons: (
      <>
        <button
          onClick={async () => {
            setFlash({ message: "", type: "" }); // Close flash first
            setLoading(true);
            try {
              const res = await fetch(`${BASE_URL}/api/inventory/${id}/delete`, {
                method: "DELETE",
              });

              const data = await res.json();

              if (res.ok) {
                setProducts((prev) => prev.filter((product) => product._id !== id));
                setFlash({ message: "🗑️ Product and all assigned inventories deleted!", type: "success" });
              } else {
                setFlash({ message: data.message || "❌ Could not delete product", type: "error" });
              }
            } catch (err) {
              setFlash({ message: "❌ Could not delete product", type: "error" });
            } finally {
              setLoading(false);
            }
          }}
          className="mr-2 px-3 py-1 bg-red-600 text-white rounded-md"
        >
          Yes
        </button>
        <button
          onClick={() => setFlash({ message: "", type: "" })}
          className="px-3 py-1 bg-gray-600 text-white rounded-md"
        >
          No
        </button>
      </>
    ),
  });
};


  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {flash.message && (
        <FlashMessage
          message={flash.message}
          type={flash.type}
          customButtons={flash.buttons}
          onClose={() => setFlash({ message: "", type: "" })}
        />
      )}

      <div className="w-full min-h-screen bg-[#0a192f] px-6 py-6">
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
    <h2 className="text-3xl font-bold text-white">My Products</h2>
    <p className="text-gray-400 text-sm">Manage your inventory efficiently</p>
  </div>
</header>

        {/* Back & Add Buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-[#112240] hover:bg-[#15305a] text-white px-4 py-2 rounded-lg border border-blue-400 transition-all"
          >
            <ArrowBigLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 hover:opacity-90 transition"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Product</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-[#112240] border border-blue-400/30 rounded-xl p-6 mb-8 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a192f] border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#112240] border border-blue-400 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center text-gray-300 p-10">Loading...</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-[#0b1b33] border-b border-blue-400">
                  <tr>
                    {["Product", "Available Qty", "Total Qty", "Category", "Description", "Actions"].map((header) => (
                      <th key={header} className="text-left p-4 text-white font-semibold">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="border-b border-slate-700 hover:bg-slate-800 transition-colors duration-200">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={product.image ? `http://localhost:5757/${product.image}` : "/placeholder.svg"}
                          alt="product"
                          className="w-12 h-12 rounded-md object-cover border border-slate-700"
                        />
                        <span className="text-white font-medium">{product.name}</span>
                      </td>
                      <td className="p-4 text-yellow-400">{product.availableQty}</td>
                      <td className="p-4 text-blue-400">{product.totalQuantity}</td>
                      <td className="p-4 text-white">{product.category}</td>
                      <td className="p-4 text-gray-300">{product.description}</td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="text-blue-400 hover:bg-blue-500/20 p-2 rounded-md border border-blue-400/40"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDeleteProduct(product._id)}
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
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    <ChevronLeft />
                  </button>
                  <span className="text-white px-2 py-2">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
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

        {/* Forms */}
        {showForm && (
          <ProductForm onSubmit={handleAddProduct} onCancel={() => setShowForm(false)} isLoading={formLoading} />
        )}
        {editingProduct && (
          <ProductForm product={editingProduct} onSubmit={handleEditProduct} onCancel={() => setEditingProduct(null)} isLoading={formLoading} />
        )}
      </div>
    </>
  );
}
