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
      <div className=" mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#3F75B0] mb-2">Inventory</h2>
            
          </div>
          
          {/* Add Product Button */}
          <button
            onClick={handleAddProduct}
            className="px-4 py-2 bg-[#29996B] hover:bg-green-700 text-white font-medium rounded-lg shadow-sm focus:outline-none  transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b  border-[#E1F2F5]">
            
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