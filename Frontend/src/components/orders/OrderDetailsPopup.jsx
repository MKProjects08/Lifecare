import React from 'react';

const OrderDetailsPopup = ({ order, onClose }) => {
  if (!order) return null;

  // Helper function to safely convert to number and format
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '$0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '$0.00' : `$${numValue.toFixed(2)}`;
  };

  // Helper function to safely get numbers for calculations
  const getNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? 0 : numValue;
  };

  // Calculate totals safely
  const grossTotal = getNumber(order.gross_total);
  const discountAmount = getNumber(order.discount_amount);
  const netTotal = getNumber(order.net_total);

  return (
    <div className="fixed inset-0 bg-black/50 b flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#3F75B0] text-bold">Order Details - {order.FormattedOrderID || `ORD-${order.Order_ID || order.id}`}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-[#E1F2F5] rounded">
          <div>
            <p className="mb-2">
              <strong>Customer:</strong> {order.CustomerName || 'N/A'}
            </p>
            <p className="mb-2">
              <strong>Agency:</strong> {order.AgencyName || 'N/A'}
            </p>
            <p className="mb-2">
              <strong>Created By:</strong> {order.UserName || 'N/A'}
            </p>
            <p>
              <strong>Order Date:</strong> {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong>Gross Total:</strong> {formatCurrency(grossTotal)}
            </p>
            <p className="mb-2">
              <strong>Discount:</strong> {formatCurrency(discountAmount)}
            </p>
            <p className="mb-2">
              <strong>Net Total:</strong> {formatCurrency(netTotal)}
            </p>
            <p>
              <strong>Payment Status:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                order.paymentstatus === 'paid' ? 'bg-green-100 text-green-800' :
                order.paymentstatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.paymentstatus || 'unknown'}
              </span>
            </p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Order Items</h3>
          {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-[#E1F2F5]">
                    <th className="py-2 px-4 border-b text-left">Product ID</th>
                    <th className="py-2 px-4 border-b text-left">Batch Number</th>
                    <th className="py-2 px-4 border-b text-left">Quantity</th>
                    <th className="py-2 px-4 border-b text-left">Free Issue Qty</th>
                    <th className="py-2 px-4 border-b text-left">Total Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => {
                    const quantity = getNumber(item.quantity);
                    const freeQty = getNumber(item.free_issue_quantity);
                    const totalQty = quantity + freeQty;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 text-left border-[#E1F2F5]">
                        <td className="py-2 px-4 border-b">{item.productId || 'N/A'}</td>
                        <td className="py-2 px-4 border-b">{item.batchNumber || 'N/A'}</td>
                        <td className="py-2 px-4 border-b">{quantity}</td>
                        <td className="py-2 px-4 border-b">{freeQty}</td>
                        <td className="py-2 px-4 border-b font-semibold">{totalQty}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No items found for this order.</p>
              <p className="text-sm mt-2">Items data might not be loaded or the order has no items.</p>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Financial Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Gross Total:</span>
                <span className="font-semibold">{formatCurrency(grossTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount Applied:</span>
                <span className="font-semibold text-red-600">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-1 mt-1">
                <span>Net Total:</span>
                <span className="font-semibold text-green-600">{formatCurrency(netTotal)}</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Items Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span className="font-semibold">
                  {order.items && Array.isArray(order.items) ? order.items.length : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Free Quantity:</span>
                <span className="font-semibold">
                  {order.items && Array.isArray(order.items) 
                    ? order.items.reduce((sum, item) => sum + getNumber(item.free_issue_quantity), 0)
                    : 0
                  }
                </span>
              </div>
              <div className="flex justify-between border-t border-green-200 pt-1 mt-1">
                <span>Total Paid Quantity:</span>
                <span className="font-semibold">
                  {order.items && Array.isArray(order.items) 
                    ? order.items.reduce((sum, item) => sum + getNumber(item.quantity), 0)
                    : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPopup;