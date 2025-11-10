import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import OrderDetailsPopup from './OrderDetailsPopup';

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const ordersData = await orderService.getAllOrders();
      setOrders(ordersData);
    } catch (err) {
      setError('Failed to load orders: ' + err.message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      setLoadingOrderId(orderId);
      setError('');
      const orderDetails = await orderService.getOrderById(orderId);
      console.log('Order details received:', orderDetails); // Debug log
      setSelectedOrder(orderDetails);
      setShowPopup(true);
    } catch (err) {
      setError('Failed to load order details: ' + err.message);
      console.error('Error loading order details:', err);
    } finally {
      setLoadingOrderId(null);
    }
  };

  const handlePrint = (order) => {
    const oid = order.Order_ID || order.id;
    if (!oid) return;
    navigate(`/print/${oid}`);
  };

  const getPrintLabel = (order) => {
    const printCount = order.print_count || 0;
    return printCount === 0 ? 'Original' : `Copy (${printCount})`;
  };

  const getPrintButtonClass = (order) => {
    const printCount = order.print_count || 0;
    return printCount === 0 
      ? ' text-[#29996B]'
      : 'text-orange-300 ';
  };

  // Helper function to safely format currency in table
  const formatTableCurrency = (value) => {
    if (value === null || value === undefined) return '0.00';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0.00' : `${numValue.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <div className="flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={loadOrders}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-4 bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-[#E1F2F5]">
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Order ID</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Customer Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Agency Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Gross Total</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Print</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.Order_ID || order.id} className="border-b border-[#E1F2F5] hover:bg-gray-50 text-left">
                  <td className="py-3 px-4">
                    <span className="font-mono text-blue-600">
                      {order.FormattedOrderID || `ORD-${order.Order_ID || order.id}`}
                    </span>
                  </td>
                  <td className="py-3 px-4">{order.CustomerName || 'N/A'}</td>
                  <td className="py-3 px-4">{order.AgencyName || 'N/A'}</td>
                  <td className="py-3 px-4 font-semibold">
                    <div className="flex items-center gap-2">
                      <span>{formatTableCurrency(order.gross_total)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        order.paymentstatus === 'paid' ? 'bg-green-100 text-green-800' :
                        order.paymentstatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.paymentstatus || 'unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (order.print_count || 0) === 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {getPrintLabel(order)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewOrder(order.Order_ID || order.id)}
                        disabled={loadingOrderId === (order.Order_ID || order.id)}
                        className="flex items-center   px-3 py-1   text-sm  disabled:cursor-not-allowed"
                        title="View Order Details"
                      >
                        {loadingOrderId === (order.Order_ID || order.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            Loading...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="#3F75B0" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                           
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handlePrint(order)}
                        className={`flex items-center   px-3 py-1 rounded text-sm ${getPrintButtonClass(order)}`}
                        title="Print Order"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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

      {/* Order Details Popup */}
      {showPopup && (
        <OrderDetailsPopup
          order={selectedOrder}
          onClose={() => {
            setShowPopup(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default OrdersTable;