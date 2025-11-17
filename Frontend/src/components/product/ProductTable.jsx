// src/components/product/ProductTable.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import SmartProductModal from "../product/ProductModal";
import { productService } from "../../services/productService";
import { agencyService } from "../../services/agencyService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProductTable = ({ filters }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [agencies, setAgencies] = useState([]);
  const [agenciesLoading, setAgenciesLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* -----------------------------------------------------------------
     FETCH AGENCIES + PRODUCTS
  ----------------------------------------------------------------- */
  const fetchAgencies = async () => {
    try {
      setAgenciesLoading(true);
      const data = await agencyService.getAllAgencies();
      setAgencies(data);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      setAgencies([]);
    } finally {
      setAgenciesLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchAgencies();
      await fetchProducts();
    };
    fetchData();
  }, []);

  // Reset page when filters or rowsPerPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, rowsPerPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -----------------------------------------------------------------
     DATE HELPERS
  ----------------------------------------------------------------- */
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };

  /* -----------------------------------------------------------------
     MAP API → UI
  ----------------------------------------------------------------- */
  const mapProductToComponent = (product) => {
    if (!product) return null;

    const agency = agencies.find(
      (a) =>
        a.Agency_ID == product.Agency_ID ||
        a.agency_id == product.Agency_ID ||
        a.id == product.Agency_ID
    );

    const agencyName = agency
      ? agency.agencyname || agency.name || `Agency ${product.Agency_ID}`
      : `Agency ${product.Agency_ID}`;

    return {
      id: product.Product_ID,
      batchNumber: product.BatchNumber,
      name: product.productname,
      genericName: product.generic_name,
      quantity: product.quantity || 0,
      expiryDate: formatDateForInput(product.expiry_date),
      createdDate: formatDateForInput(
        product.created_at ||
        product.createdAt ||
        product.created_date ||
        product.createdDate
      ),
      agency: agencyName,
      purchaseRate: parseFloat(product.purchase_price) || 0,
      sellingRate: parseFloat(product.selling_price) || 0,
      Agency_ID: product.Agency_ID,
      is_active: product.is_active,
      _original: product,
    };
  };

  const getMappedProducts = () => {
    return products.map(mapProductToComponent).filter((p) => p !== null);
  };

  /* -----------------------------------------------------------------
     FILTER LOGIC
  ----------------------------------------------------------------- */
  const filteredProducts = getMappedProducts().filter((product) => {
    if (!product) return false;

    const matchesAgency =
      !filters.agency ||
      product.agency.toLowerCase().includes(filters.agency.toLowerCase());

    const matchesProductName =
      !filters.productName ||
      (product.name &&
        product.name.toLowerCase().includes(filters.productName.toLowerCase()));

    const matchesStartDate =
      !filters.startDate || product.createdDate >= filters.startDate;
    const matchesEndDate =
      !filters.endDate || product.createdDate <= filters.endDate;

    return (
      matchesAgency && matchesProductName && matchesStartDate && matchesEndDate
    );
  });

  /* -----------------------------------------------------------------
     FIXED ROWS-PER-PAGE OPTION
  ----------------------------------------------------------------- */
  const pageSizeOptions = useMemo(() => {
    return [15];
  }, []);

  useEffect(() => {
    if (!pageSizeOptions.includes(rowsPerPage)) {
      setRowsPerPage(pageSizeOptions[0] || 10);
    }
  }, [pageSizeOptions, rowsPerPage]);

  /* -----------------------------------------------------------------
     PAGINATION LOGIC
  ----------------------------------------------------------------- */
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredProducts.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / rowsPerPage));

  const getPageNumbers = () => {
    const pages = [];

    pages.push(1);
    if (currentPage > 3) pages.push(-1);

    for (let i = Math.max(2, currentPage - 1); i < currentPage; i++) {
      pages.push(i);
    }

    if (currentPage !== 1 && currentPage !== totalPages) {
      pages.push(currentPage);
    }

    for (
      let i = currentPage + 1;
      i <= Math.min(totalPages - 1, currentPage + 2);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push(-1);

    if (totalPages > 1 && pages[pages.length - 1] !== totalPages) {
      pages.push(totalPages);
    }

    return Array.from(new Set(pages.filter((p) => p > 0)));
  };

  /* -----------------------------------------------------------------
     CALCULATIONS
  ----------------------------------------------------------------- */
  const calculateTotalValue = (price, quantity) =>
    (price * quantity).toFixed(2);

  const totalStockValue = filteredProducts.reduce((total, p) => {
    return total + p.sellingRate * p.quantity;
  }, 0);

  /* -----------------------------------------------------------------
     MODAL HANDLERS
  ----------------------------------------------------------------- */
  const handleView = (product) => {
    const productData = {
      Product_ID: product.id,
      BatchNumber: product.batchNumber,
      productname: product.name,
      generic_name: product.genericName,
      quantity: product.quantity,
      purchase_price: product.purchaseRate.toString(),
      selling_price: product.sellingRate.toString(),
      expiry_date: product.expiryDate,
      Agency_ID: product.Agency_ID,
      is_active: product.is_active,
      ...product._original,
    };
    setSelectedProduct(productData);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    if (!product || !product.batchNumber) {
      alert("Error: Could not load product data for editing");
      return;
    }
    const productData = {
      Product_ID: product.id,
      BatchNumber: product.batchNumber,
      productname: product.name,
      generic_name: product.genericName,
      quantity: product.quantity,
      purchase_price: product.purchaseRate.toString(),
      selling_price: product.sellingRate.toString(),
      expiry_date: product.expiryDate,
      Agency_ID: product.Agency_ID,
      is_active: product.is_active,
      ...product._original,
    };
    setSelectedProduct(productData);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = async (batchNumber) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productService.deleteProduct(batchNumber);
        await fetchProducts();
        toast.success("Product deleted successfully!");
      } catch (err) {
        console.error("Error deleting product:", err);
        toast.error(`Error deleting product: ${err.message}`);
      }
    }
  };

  const handleSave = async () => {
    try {
      await fetchProducts();
      setIsModalOpen(false);
      setSelectedProduct(null);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error handling save:", err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleAddNew = () => {
    setSelectedProduct(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleRetry = () => {
    fetchProducts();
    fetchAgencies();
  };

  /* -----------------------------------------------------------------
     MAIN RENDER
  ----------------------------------------------------------------- */
  return (
    <>
      {/* Conditional Content */}
      {!loading && !agenciesLoading && !error ? (
        <>
          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-[#E1F2F5]">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Batch Number</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Product Name</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Generic Name</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Quantity</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Expiry Date</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Agency</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Selling Price</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Total Value</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-4 px-4 text-center text-gray-500">
                      {products.length === 0
                        ? "No products found in database"
                        : "No products match your filters"}
                    </td>
                  </tr>
                ) : (
                  currentRows.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-[#E1F2F5] hover:bg-gray-50 text-left"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-blue-600">{product.batchNumber}</span>
                      </td>
                      <td className="py-3 px-4">{product.name}</td>
                      <td className="py-3 px-4">{product.genericName}</td>
                      <td className="py-3 px-4">{product.quantity}</td>
                      <td className="py-3 px-4">{product.expiryDate}</td>
                      <td className="py-3 px-4">{product.agency}</td>
                      <td className="py-3 px-4 font-semibold">{product.sellingRate.toFixed(2)}</td>
                      <td className="py-3 px-4 font-semibold">
                        {calculateTotalValue(product.sellingRate, product.quantity)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button onClick={() => handleView(product)} title="View Product">
                            <svg className="w-5 h-5" fill="none" stroke="#3F75B0" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          <button onClick={() => handleEdit(product)} title="Edit Product">
                            <svg className="w-4 h-4" fill="none" stroke="#29996B" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          <button onClick={() => handleDelete(product.batchNumber)} title="Delete Product">
                            <svg className="w-4 h-4" fill="none" stroke="#DC3D3D" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Top Footer */}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700">Rows per page:</span>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 border border-gray-300 rounded px-3 py-1 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {rowsPerPage}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-20 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                    {pageSizeOptions.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setRowsPerPage(size);
                          setDropdownOpen(false);
                        }}
                        className="block w-full text-left w-10  px-3 py-2 text-sm hover:bg-blue-100 transition-colors"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            
            </div>

            <div className="text-sm font-semibold text-gray-700">
              Total Stock Value: {totalStockValue.toFixed(2)}
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex justify-center items-center space-x-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>

              {getPageNumbers().length > 0 ? (
                getPageNumbers().map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      currentPage === num
                        ? "bg-[#3F75B0] text-white"
                        : "border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {num}
                  </button>
                ))
              ) : (
                <button className="px-3 py-1 rounded text-sm font-medium bg-[#3F75B0] text-white">
                  1
                </button>
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Showing {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, filteredProducts.length)} of {filteredProducts.length} products
            </div>
          </div>

          {/* Modal */}
          {isModalOpen && (
            <SmartProductModal
              product={selectedProduct}
              mode={modalMode}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedProduct(null);
              }}
              onSave={handleSave}
            />
          )}
        </>
      ) : loading || agenciesLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex justify-between items-center">
            <span>Error loading products: {error}</span>
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ALWAYS MOUNTED TOAST CONTAINER */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default ProductTable;