import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';

const PrintOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const incrementedRef = useRef(false);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const format = (n) => {
    const v = typeof n === 'string' ? parseFloat(n) : n;
    return isNaN(v) ? '0.00' : v.toFixed(2);
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try { return new Date(d).toLocaleDateString(); } catch { return 'N/A'; }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const details = await orderService.getOrderById(id);
        setOrder(details);
        if (!incrementedRef.current) {
          incrementedRef.current = true;
          try {
            await orderService.incrementPrintCount(id);
            const updated = await orderService.getOrderById(id);
            setOrder(updated);
          } catch (e) { /* non-blocking */ }
        }
        // Optional: auto-open print dialog after a short delay
        setTimeout(() => {
          if (window && window.print) {
            try { window.print(); } catch {}
          }
        }, 300);
      } catch (e) {
        setError('Failed to load order for printing: ' + e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-gray-200">Back</button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header controls - hidden in print */}
      <div className="p-4 border-b flex justify-between items-center print:hidden">
        <h1 className="text-xl font-semibold text-[#3F75B0]">Print Preview</h1>
        <div className="space-x-2">
          <button onClick={() => window.print()} className="px-4 py-2 rounded bg-blue-600 text-white">Print</button>
          <button onClick={() => navigate(-1)} className="px-4 py-2 rounded border">Back</button>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-4xl mx-auto p-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-1">Invoiced To: {order.CustomerName || 'N/A'}</h1>
            <p className="text-sm">Memorandum of {order.AgencyName || 'Agency'}</p>
            <p className="text-sm">Order Date: {formatDate(order.created_at)}</p>
          </div>
          
          <div className="border-t-2 border-b-2 border-black py-3 mb-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p><span className="font-semibold">Invoice No:</span> {order.FormattedOrderID || `ORD-${order.Order_ID || order.id}`}</p>
                <p><span className="font-semibold">Sales Person:</span> {order.SalesPersonName || '-'}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">Description</p>
                <p className="mt-1">
                  <span className={`px-3 py-1 text-xs font-medium ${
                    (order.print_count || 0) === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {(order.print_count || 0) === 0 ? 'Original' : `Copy (${order.print_count})`}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p><span className="font-semibold">Payment Status:</span> {order.paymentstatus || 'Pending'}</p>
                <p><span className="font-semibold">Total Items:</span> {items.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details Table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="text-left py-2 px-2 font-semibold">Original</th>
              <th className="text-left py-2 px-2 font-semibold">Institution (or Name)</th>
              <th className="text-center py-2 px-2 font-semibold">Batch No</th>
              <th className="text-center py-2 px-2 font-semibold">Exp Date</th>
              <th className="text-center py-2 px-2 font-semibold">Qty (FOC)</th>
              <th className="text-right py-2 px-2 font-semibold">Price</th>
              <th className="text-right py-2 px-2 font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="text-center py-6 text-gray-500" colSpan={7}>No items found</td>
              </tr>
            ) : (
              items.map((it, idx) => {
                const qty = Number(it.quantity) || 0;
                const free = Number(it.free_issue_quantity) || 0;
                const rate = Number(it.rate) || 0;
                const amount = qty * rate;
                return (
                  <tr key={idx} className="border-b border-gray-300">
                    <td className="py-2 px-2 align-top">
                      <span className={`text-xs px-2 py-1 ${
                        (order.print_count || 0) === 0 ? 'bg-green-50' : 'bg-orange-50'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-2 px-2">{it.productName || it.productId || '-'}</td>
                    <td className="text-center py-2 px-2">{it.batchNumber || '-'}</td>
                    <td className="text-center py-2 px-2">{formatDate(it.expiryDate)}</td>
                    <td className="text-center py-2 px-2">{qty} {free > 0 ? `(${free})` : ''}</td>
                    <td className="text-right py-2 px-2">{format(rate)}</td>
                    <td className="text-right py-2 px-2">{format(amount)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="border-t-2 border-black pt-4 mb-6">
          <div className="flex justify-between">
            <div className="w-1/2">
              <p className="text-sm mb-1"><span className="font-semibold">Total No of Items:</span> {items.length}</p>
            </div>
            <div className="w-1/2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Net Product Value:</span>
                <span>{format(order.gross_total || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Discount Value:</span>
                <span>{format(order.discount_amount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-black pt-1 mt-2">
                <span className="font-bold">Total Value:</span>
                <span className="font-bold">{format((order.gross_total || 0) - (order.discount_amount || 0))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-10 border-t-2 border-black pt-6">
          <div className="grid grid-cols-2 gap-8 text-sm mb-8">
            <div>
              <p className="font-semibold mb-1">Customer Signature:</p>
              <div className="border-b border-black mt-12"></div>
            </div>
            <div>
              <p className="font-semibold mb-1">Approved above items in this invoice</p>
              <p className="text-xs mt-2">Accepted By:</p>
              <div className="border-b border-black mt-10"></div>
            </div>
          </div>
          
          <div className="text-center text-xs mt-10">
            <p className="font-semibold mb-1">Invoiced By:</p>
            <div className="border-b border-black w-64 mx-auto mt-10"></div>
            <p className="mt-3 text-gray-600">Authorized by:</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintOrder