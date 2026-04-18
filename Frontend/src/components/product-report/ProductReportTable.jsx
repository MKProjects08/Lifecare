import React from "react";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB");
};

const formatMoney = (value) => {
  const amount = Number(value) || 0;
  return amount.toFixed(2);
};

const ProductReportTable = ({ rows = [], loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
        Loading product report...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-[#E1F2F5] text-[#2f4f73]">
          <tr>
            <th className="text-left px-4 py-3">Product</th>
            <th className="text-left px-4 py-3">Batch</th>
            <th className="text-left px-4 py-3">Expiry</th>
            <th className="text-right px-4 py-3">Selling Price</th>
            <th className="text-right px-4 py-3">Sold Qty</th>
            <th className="text-right px-4 py-3">Free Qty</th>
            <th className="text-right px-4 py-3">Orders</th>
            <th className="text-right px-4 py-3">Sales Value</th>
            <th className="text-left px-4 py-3">Last Sale</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                No sold products found for selected filters.
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={`${row.Product_ID}-${row.BatchNumber}-${idx}`} className="border-t border-gray-100">
                <td className="px-4 py-3">{row.productname || "-"}</td>
                <td className="px-4 py-3">{row.BatchNumber || "-"}</td>
                <td className="px-4 py-3">{formatDate(row.expiry_date)}</td>
                <td className="px-4 py-3 text-right">{formatMoney(row.selling_price)}</td>
                <td className="px-4 py-3 text-right">{Number(row.sold_quantity) || 0}</td>
                <td className="px-4 py-3 text-right">{Number(row.free_issue_quantity) || 0}</td>
                <td className="px-4 py-3 text-right">{Number(row.order_count) || 0}</td>
                <td className="px-4 py-3 text-right">{formatMoney(row.total_sales_value)}</td>
                <td className="px-4 py-3">{formatDate(row.last_sale_date)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductReportTable;
