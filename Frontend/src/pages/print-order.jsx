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
    try { 
      const date = new Date(d);
      return date.toLocaleDateString('en-GB'); 
    } catch { 
      return 'N/A'; 
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const details = await orderService.getOrderById(id);
        console.log('Loaded order data:', details); // Debug log
        setOrder(details);
        
        if (!incrementedRef.current) {
          incrementedRef.current = true;
          try {
            await orderService.incrementPrintCount(id);
            const updated = await orderService.getOrderById(id);
            setOrder(updated);
          } catch (e) { 
            console.error('Print count increment failed:', e);
          }
        }
        
        setTimeout(() => {
          if (window && window.print) {
            try { window.print(); } catch {}
          }
        }, 500);
      } catch (e) {
        console.error('Failed to load order:', e);
        setError('Failed to load order for printing: ' + e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-lg">
          <p className="font-semibold mb-2">Error Loading Invoice</p>
          <p>{error}</p>
        </div>
        <div className="mt-6">
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-gray-600">No order data found</p>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const grossTotal = Number(order.gross_total || 0);
  const discountAmount = Number(order.discount_amount || 0);
  const finalTotal = grossTotal - discountAmount;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          body { 
            margin: 0; 
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden { display: none !important; }
          * { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
        }
        
        @media screen {
          body {
            background: #f3f4f6;
          }
        }
        
        .invoice-container {
          font-family: 'Arial', 'Helvetica', sans-serif;
        }
        
        table {
          border-collapse: collapse;
        }
      `}</style>

      {/* Screen-only controls */}
      <div className="p-4 bg-white border-b shadow-sm print:hidden sticky top-0 z-10">
        <div className="max-w-[21cm] mx-auto flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-800">Invoice Preview</h1>
          <div className="space-x-3">
            <button 
              onClick={() => window.print()} 
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-sm"
            >
              🖨️ Print
            </button>
            <button 
              onClick={() => navigate(-1)} 
              className="px-6 py-2.5 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Printable Invoice */}
      <div className="invoice-container max-w-[21cm] mx-auto bg-white p-8 my-6 print:my-0 shadow-lg print:shadow-none">
        
        {/* Header */}
        <div className="text-center mb-8 pb-4 border-b-4 border-gray-900">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-wide">
            Life Care Distribution
          </h1>
          <p className="text-sm text-gray-600 uppercase tracking-wider">
            Pharmaceutical Distribution Services
          </p>
        </div>

        {/* Invoice Info Section */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">INVOICE</h2>
            <div className="space-y-1 text-sm">
              <div className="flex">
                <span className="font-semibold text-gray-700 w-28">Invoice No:</span>
                <span className="text-gray-900">{order.FormattedOrderID || order.Order_ID || order.id || 'N/A'}</span>
              </div>
              <div className="flex">
                <span className="font-semibold text-gray-700 w-28">Date:</span>
                <span className="text-gray-900">{formatDate(order.created_at || order.order_date)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${
              (order.print_count || 0) === 0 
                ? 'bg-green-600 text-white' 
                : 'bg-orange-500 text-white'
            }`}>
              {(order.print_count || 0) === 0 ? 'ORIGINAL' : `COPY #${order.print_count}`}
            </div>
            <div className="mt-3 text-sm">
              <div className="flex justify-end">
                <span className="font-semibold text-gray-700 mr-2">Payment Status:</span>
                <span className={`font-semibold ${
                  order.paymentstatus === 'Paid' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {order.paymentstatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
          <p className="text-xs font-bold text-gray-600 uppercase mb-1">Bill To:</p>
          <p className="text-lg font-bold text-gray-900">
            {order.CustomerName || order.customer_name || 'N/A'}
          </p>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <table className="w-full text-sm border-2 border-gray-900">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="text-left py-3 px-3 font-bold border-r border-gray-700" style={{ width: '5%' }}>
                  #
                </th>
                <th className="text-left py-3 px-3 font-bold border-r border-gray-700" style={{ width: '32%' }}>
                  Product Name
                </th>
                <th className="text-center py-3 px-2 font-bold border-r border-gray-700" style={{ width: '12%' }}>
                  Batch No
                </th>
                <th className="text-center py-3 px-2 font-bold border-r border-gray-700" style={{ width: '11%' }}>
                  Exp. Date
                </th>
                <th className="text-center py-3 px-2 font-bold border-r border-gray-700" style={{ width: '8%' }}>
                  Qty
                </th>
                <th className="text-center py-3 px-2 font-bold border-r border-gray-700" style={{ width: '8%' }}>
                  FOC
                </th>
                <th className="text-right py-3 px-3 font-bold border-r border-gray-700" style={{ width: '12%' }}>
                  Rate
                </th>
                <th className="text-right py-3 px-3 font-bold" style={{ width: '12%' }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {items.length === 0 ? (
                <tr>
                  <td className="text-center py-10 text-gray-500 border border-gray-300" colSpan={8}>
                    No items found in this order
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const qty = Number(item.quantity) || 0;
                  const foc = Number(item.free_issue_quantity) || 0;
                  const rate = Number(item.rate) || 0;
                  const amount = qty * rate;
                  
                  return (
                    <tr key={idx} className="border-b border-gray-300 hover:bg-gray-50">
                      <td className="py-3 px-3 text-center font-semibold text-gray-700 border-r border-gray-300">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 text-gray-900 border-r border-gray-300">
                        {item.productName || item.product_name || item.productId || '-'}
                      </td>
                      <td className="text-center py-3 px-2 text-gray-700 border-r border-gray-300">
                        {item.batchNumber || item.batch_number || '-'}
                      </td>
                      <td className="text-center py-3 px-2 text-gray-700 border-r border-gray-300">
                        {formatDate(item.expiryDate || item.expiry_date)}
                      </td>
                      <td className="text-center py-3 px-2 font-semibold text-gray-900 border-r border-gray-300">
                        {qty}
                      </td>
                      <td className="text-center py-3 px-2 text-gray-600 border-r border-gray-300">
                        {foc > 0 ? foc : '-'}
                      </td>
                      <td className="text-right py-3 px-3 text-gray-900 border-r border-gray-300">
                        {format(rate)}
                      </td>
                      <td className="text-right py-3 px-3 font-semibold text-gray-900">
                        {format(amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="flex justify-between mb-8">
          <div className="w-1/2 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
            <p className="text-base font-bold text-gray-800">
              Total Items: <span className="ml-2 text-gray-900">{items.length}</span>
            </p>
          </div>
          
          <div className="w-5/12">
            <table className="w-full border-2 border-gray-900">
              <tbody>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <td className="px-4 py-3 font-semibold text-gray-700">Net Product Value:</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{format(grossTotal)}</td>
                </tr>
                <tr className="bg-white border-b-2 border-gray-300">
                  <td className="px-4 py-3 font-semibold text-gray-700">Discount:</td>
                  <td className="px-4 py-3 text-right font-semibold text-red-600">-{format(discountAmount)}</td>
                </tr>
                <tr className="bg-gray-900 text-white">
                  <td className="px-4 py-4 font-bold text-base">TOTAL AMOUNT:</td>
                  <td className="px-4 py-4 text-right font-bold text-lg">{format(finalTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Signature Section */}
        <div className="mt-12 pt-6 border-t-2 border-gray-400">
          <div className="grid grid-cols-2 gap-16">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Customer Signature:</p>
              <div className="mt-20 border-b-2 border-gray-800"></div>
              <p className="text-xs text-gray-600 mt-2">Date: _______________</p>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Authorized Signature:</p>
              <div className="mt-20 border-b-2 border-gray-800"></div>
              <p className="text-xs text-gray-600 mt-2">Name & Stamp</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-4 border-t border-gray-300 text-center">
          <p className="text-xs text-gray-600">Thank you for your business!</p>
          <p className="text-xs text-gray-500 mt-1">This is a computer-generated invoice</p>
        </div>
      </div>
    </div>
  );
};

export default PrintOrder;