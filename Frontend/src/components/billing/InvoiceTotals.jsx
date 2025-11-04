// src/components/billing/InvoiceTotals.jsx
import React from 'react';

const InvoiceTotals = ({ grossTotal, discount, freeQuantityDiscount, onDiscountChange }) => {
  const totalDiscount = discount + freeQuantityDiscount;

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md ml-auto">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">Gross Total:</p>
          <p className="text-lg font-semibold text-gray-900">{grossTotal.toFixed(2)}</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">Free Qty Discount:</p>
          <p className="text-sm text-gray-900">{freeQuantityDiscount.toFixed(2)}</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">Additional Discount:</p>
          <div className="flex items-center justify-end gap-2">
            <span className="text-gray-500"></span>
            <input
              type="number"
              min="0"
              max={grossTotal}
              value={discount}
              onChange={(e) => onDiscountChange(Math.max(0, Math.min(grossTotal, parseFloat(e.target.value) || 0)))}
              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          <p className="text-sm font-medium text-gray-700 mt-2">Total Discount:</p>
          <p className="text-sm text-red-600">{totalDiscount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTotals;