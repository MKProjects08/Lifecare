// src/pages/admin/Products.jsx
import React, { useState } from "react";
import ProductTable from "../components/product/ProductTable";
import ProductFilters from "../components/product/ProductFilters";
import SmartProductModal from "../components/product/ProductModal";
import { productService } from "../services/productService";

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

  const handlePrint = async () => {
    try {
      const html = await productService.getProductsReportPrintHtml(filters);
      document.open();
      document.write(html);
      document.close();
    } catch (e) {
      console.error('Failed to open printable products report:', e);
      alert('Failed to open products report for printing: ' + (e.message || 'Unknown error'));
    }
  };

  const handleDownloadExcel = async () => {
    try {
      await productService.downloadProductsReportExcel(filters);
    } catch (e) {
      console.error('Failed to download products report Excel:', e);
      alert('Failed to download products report Excel: ' + (e.message || 'Unknown error'));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className=" mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#3F75B0] mb-2">Inventory</h2>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-[#048dcc] text-[#048dcc] rounded-lg shadow-sm hover:bg-[#E1F2F5] focus:outline-none transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V4a2 2 0 012-2h8a2 2 0 012 2v5M6 18H5a2 2 0 01-2-2v-5a2 2 0 012-2h14a2 2 0 012 2v5a2 2 0 01-2 2h-1M10 18h4" />
              </svg>
              Print
            </button>

            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2 bg-white border border-[#29996B] text-[#29996B] rounded-lg shadow-sm hover:bg-[#E1F2F5] focus:outline-none transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>

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
        </div>

        <div className="">
        <div className="bg-white border border-[#3F75B0] rounded-lg shadow p-6 mb-6">
            
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