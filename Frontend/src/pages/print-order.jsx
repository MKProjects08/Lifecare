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
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Invoice</h2>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <p>{order.FormattedOrderID || `ORD-${order.Order_ID || order.id}`}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              (order.print_count || 0) === 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {(order.print_count || 0) === 0 ? 'Original' : `Copy (${order.print_count})`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">Customer</p>
            <p className="font-medium">{order.CustomerName || 'N/A'}</p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">Agency</p>
            <p className="font-medium">{order.AgencyName || 'N/A'}</p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium">{formatDate(order.created_at)}</p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">Payment Status</p>
            <p className="font-medium capitalize">{order.paymentstatus || 'unknown'}</p>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-3 py-2 text-left">Product</th>
              <th className="border px-3 py-2 text-left">Batch</th>
              <th className="border px-3 py-2 text-left">Expiry</th>
              <th className="border px-3 py-2 text-right">Qty</th>
              <th className="border px-3 py-2 text-right">Free</th>
              <th className="border px-3 py-2 text-right">Rate</th>
              <th className="border px-3 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="border px-3 py-2 text-center text-gray-500" colSpan={7}>No items</td>
              </tr>
            ) : (
              items.map((it, idx) => {
                const qty = Number(it.quantity) || 0;
                const free = Number(it.free_issue_quantity) || 0;
                const rate = Number(it.rate) || 0;
                const amount = qty * rate;
                return (
                  <tr key={idx}>
                    <td className="border px-3 py-2">{it.productName || it.productId}</td>
                    <td className="border px-3 py-2">{it.batchNumber || '-'}</td>
                    <td className="border px-3 py-2">{formatDate(it.expiryDate)}</td>
                    <td className="border px-3 py-2 text-right">{qty}</td>
                    <td className="border px-3 py-2 text-right">{free}</td>
                    <td className="border px-3 py-2 text-right">{format(rate)}</td>
                    <td className="border px-3 py-2 text-right">{format(amount)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">Discount</p>
            <p className="text-lg font-semibold">{format(order.discount_amount || 0)}</p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm text-gray-500">Gross Total</p>
            <p className="text-lg font-semibold">{format(order.gross_total || 0)}</p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Thank you for your business.</p>
        </div>
      </div>
    </div>
  );
};

export default PrintOrder;
