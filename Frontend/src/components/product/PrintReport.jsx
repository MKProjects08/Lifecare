// src/components/product/PrintReport.jsx
import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';

const PrintReport = ({ onClose }) => {
  const reportRef = useRef();

  const sampleProducts = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      genericName: "Paracetamol",
      batchNumber: "PCM2024001",
      quantity: 500,
      expiryDate: "2025-12-31",
      agency: "Agency 1",
      sellingRate: 8.00
    },
    {
      id: 2,
      name: "Amoxicillin 250mg",
      genericName: "Amoxicillin",
      batchNumber: "AMX2024015",
      quantity: 200,
      expiryDate: "2025-06-30",
      agency: "Agency 2",
      sellingRate: 18.00
    },
    {
      id: 3,
      name: "Cetirizine 10mg",
      genericName: "Cetirizine Hydrochloride",
      batchNumber: "CTZ2024032",
      quantity: 150,
      expiryDate: "2025-09-15",
      agency: "Agency 1",
      sellingRate: 6.00
    },
    {
      id: 4,
      name: "Omeprazole 20mg",
      genericName: "Omeprazole",
      batchNumber: "OMP2024008",
      quantity: 80,
      expiryDate: "2025-03-20",
      agency: "Agency 3",
      sellingRate: 12.00
    },
    {
      id: 5,
      name: "Motifomelia 500mg",
      genericName: "Motifomelia",
      batchNumber: "MTE2024018",
      quantity: 300,
      expiryDate: "2025-01-10",
      agency: "Agency 4",
      sellingRate: 7.00
    }
  ];

  const totalValue = sampleProducts.reduce((total, product) => {
    return total + (product.sellingRate * product.quantity);
  }, 0);

  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 1,
      filename: 'inventory-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handlePrint = () => {
    const element = reportRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .header { text-align: center; margin-bottom: 30px; }
            .total { font-weight: bold; background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Print Inventory Report</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div ref={reportRef} className="bg-white p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Inventory Report</h1>
              <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Batch Number</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Product Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Generic Name</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Expiry Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Agency</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {sampleProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="border border-gray-300 px-4 py-2">{product.batchNumber}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.genericName}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.expiryDate}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.agency}</td>
                    <td className="border border-gray-300 px-4 py-2">${product.sellingRate.toFixed(2)}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      ${(product.sellingRate * product.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan="7" className="border border-gray-300 px-4 py-2 text-right">
                    Total Stock Value:
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    ${totalValue.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintReport;