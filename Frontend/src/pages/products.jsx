// src/pages/admin/Products.jsx
import React, { useState } from "react";
import ProductTable from "../components/product/ProductTable";
import ProductFilters from "../components/product/ProductFilters";
import SmartProductModal from "../components/product/ProductModal";

const Products = () => {
  const [filters, setFilters] = useState({
    agency: "",
    productName: ""
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshTable, setRefreshTable] = useState(0);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleSaveProduct = (savedProduct) => {
    // Refresh the table to show the new/updated product
    setRefreshTable(prev => prev + 1);
    setShowAddModal(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory</h1>
            <p className="text-gray-600">Manage your medicine stock</p>
          </div>
          
          {/* Add Product Button */}
          <button
            onClick={handleAddProduct}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Product List</h2>
            <ProductFilters onFilterChange={handleFilterChange} />
          </div>
          <ProductTable filters={filters} refreshTrigger={refreshTable} />
        </div>
      </div>

      {/* Smart Add Product Modal */}
      {showAddModal && (
        <SmartProductModal
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default Products;