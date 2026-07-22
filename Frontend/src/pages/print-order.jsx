import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { CloudCog } from 'lucide-react';

const PrintOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAndPrint = async () => {
      try {
        setLoading(true);
        setError('');

        // Increase print count by 1 for this order
        try {
          if (id) {
            await orderService.incrementPrintCount(id);
          }
        } catch (incErr) {
          console.error('Failed to increment print count:', incErr);
          // Do not block printing if this fails
        }

        const html = await orderService.getOrderPrintHtml(id);
console.log(html);
        // Render printable HTML directly in the same tab
        document.open();
        document.write(html);
        document.close();
        console.log('HTML printed');
      } catch (e) {
        console.error('Failed to open printable invoice:', e);
        setError('Failed to open invoice for printing: ' + (e.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAndPrint();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing printable invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-lg">
          <p className="font-semibold mb-2">Error Opening Invoice</p>
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

  // Once the HTML is written to document, React UI is replaced.
  // This fallback should rarely be seen.
  return null;
};

export default PrintOrder;