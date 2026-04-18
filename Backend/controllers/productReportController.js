const db = require("../config/db");

exports.getProductSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, agencyId } = req.query;

    const whereParts = ["o.print_count > 0"];
    const params = [];

    if (agencyId) {
      whereParts.push("o.Agency_ID = ?");
      params.push(agencyId);
    }

    if (startDate) {
      whereParts.push("DATE(o.created_at) >= ?");
      params.push(startDate);
    }

    if (endDate) {
      whereParts.push("DATE(o.created_at) <= ?");
      params.push(endDate);
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const [rows] = await db.query(
      `
      SELECT
        p.Product_ID,
        p.productname,
        p.generic_name,
        oi.BatchNumber,
        p.expiry_date,
        p.selling_price,
        a.agencyname AS AgencyName,
        SUM(COALESCE(oi.quantity, 0)) AS sold_quantity,
        SUM(COALESCE(oi.free_issue_quantity, 0)) AS free_issue_quantity,
        COUNT(DISTINCT o.Order_ID) AS order_count,
        MAX(o.created_at) AS last_sale_date
      FROM OrderItem oi
      INNER JOIN Orders o ON o.Order_ID = oi.Order_ID
      LEFT JOIN products p
        ON p.Product_ID = oi.Product_ID
       AND p.BatchNumber = oi.BatchNumber
      LEFT JOIN Agency a ON p.Agency_ID = a.Agency_ID
      ${whereClause}
      GROUP BY
        p.Product_ID,
        p.productname,
        p.generic_name,
        oi.BatchNumber,
        p.expiry_date,
        p.selling_price,
        a.agencyname
      ORDER BY sold_quantity DESC, p.productname ASC
      `,
      params
    );

    const formatted = rows.map((row) => {
      const sellingPrice = Number(row.selling_price) || 0;
      const soldQuantity = Number(row.sold_quantity) || 0;
      const freeIssueQuantity = Number(row.free_issue_quantity) || 0;

      return {
        Product_ID: row.Product_ID,
        productname: row.productname || "Unknown Product",
        generic_name: row.generic_name || "-",
        AgencyName: row.AgencyName || "-",
        BatchNumber: row.BatchNumber,
        expiry_date: row.expiry_date,
        selling_price: sellingPrice,
        sold_quantity: soldQuantity,
        free_issue_quantity: freeIssueQuantity,
        order_count: Number(row.order_count) || 0,
        last_sale_date: row.last_sale_date,
        total_sales_value: sellingPrice * soldQuantity,
      };
    });

    res.json({
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        rule: "Orders with print_count > 0 are considered sales",
      },
      totalProducts: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Error in getProductSalesReport:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProductSalesReportPrintHtml = async (req, res) => {
  try {
    const { startDate, endDate, agencyId } = req.query;

    const whereParts = ["o.print_count > 0"];
    const params = [];

    if (agencyId) {
      whereParts.push("o.Agency_ID = ?");
      params.push(agencyId);
    }

    if (startDate) {
      whereParts.push("DATE(o.created_at) >= ?");
      params.push(startDate);
    }

    if (endDate) {
      whereParts.push("DATE(o.created_at) <= ?");
      params.push(endDate);
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

    const [rows] = await db.query(
      `
      SELECT
        p.Product_ID,
        p.productname,
        p.generic_name,
        oi.BatchNumber,
        p.expiry_date,
        p.selling_price,
        a.agencyname AS AgencyName,
        SUM(COALESCE(oi.quantity, 0)) AS sold_quantity,
        SUM(COALESCE(oi.free_issue_quantity, 0)) AS free_issue_quantity,
        COUNT(DISTINCT o.Order_ID) AS order_count,
        MAX(o.created_at) AS last_sale_date
      FROM OrderItem oi
      INNER JOIN Orders o ON o.Order_ID = oi.Order_ID
      LEFT JOIN products p
        ON p.Product_ID = oi.Product_ID
       AND p.BatchNumber = oi.BatchNumber
      LEFT JOIN Agency a ON p.Agency_ID = a.Agency_ID
      ${whereClause}
      GROUP BY
        p.Product_ID,
        p.productname,
        p.generic_name,
        oi.BatchNumber,
        p.expiry_date,
        p.selling_price,
        a.agencyname
      ORDER BY sold_quantity DESC, p.productname ASC
      `,
      params
    );

    const format = (n) => {
      const v = typeof n === 'string' ? parseFloat(n) : n;
      return isNaN(v) ? '0.00' : v.toFixed(2);
    };

    const formatDate = (d) => {
      if (!d) return '';
      try {
        const date = new Date(d);
        return date.toLocaleDateString('en-GB');
      } catch {
        return '';
      }
    };

    const escapeHtml = (str) => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const rowsHtml = rows.length === 0
      ? `<tr>
           <td colspan="10" style="text-align:center;padding:10px;border:1px solid #a3b8a5;color:#6b7280;">No products match the selected filters</td>
         </tr>`
      : rows.map((r, idx) => `
          <tr>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:center;">${idx + 1}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.productname || "Unknown Product")}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.generic_name || "-")}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:center;">${escapeHtml(r.BatchNumber)}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:center;">${escapeHtml(formatDate(r.expiry_date))}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.AgencyName || "-")}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:right;">${format(r.selling_price)}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:right;">${r.sold_quantity || 0}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:right;">${r.free_issue_quantity || 0}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:right;">${format((Number(r.selling_price) || 0) * (Number(r.sold_quantity) || 0))}</td>
          </tr>`).join('');

    const totals = rows.reduce((acc, r) => {
      acc.soldQty += Number(r.sold_quantity) || 0;
      acc.freeQty += Number(r.free_issue_quantity) || 0;
      acc.amount += (Number(r.selling_price) || 0) * (Number(r.sold_quantity) || 0);
      return acc;
    }, { soldQty: 0, freeQty: 0, amount: 0 });

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Product Sales Report</title>
    <style>
      @media print {
        @page { margin: 0.7cm; size: A4; }
        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
      body { font-family: Arial, Helvetica, sans-serif; background: #e3f0e8; font-size: 11px; }
      .page { width: 19.5cm; min-height: 27.5cm; margin: 0 auto; background: #f8fff9; border: 1px solid #a3b8a5; padding: 10mm; box-sizing: border-box; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6mm; }
      .title { font-size: 15px; font-weight: 700; text-transform: uppercase; }
      .sub { font-size: 10px; margin-top: 2px; }
      .meta { font-size: 10px; text-align: right; }
      table.report { width: 100%; border-collapse: collapse; font-size: 10px; }
      table.report th, table.report td { border: 1px solid #a3b8a5; padding: 2px 4px; }
      table.report th { background: #d7e7db; font-weight: 700; }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .summary { margin-top: 4mm; font-size: 10px; }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <div>
          <div class="title">Life Care Distribution</div>
          <div class="sub">Product Sales Report</div>
        </div>
        <div class="meta">
          <div>Printed: ${escapeHtml(new Date().toLocaleString('en-GB'))}</div>
        </div>
      </div>

      <div style="font-size:10px;margin-bottom:5mm;">
        <strong>Filters:</strong>
        <div>
          Agency: ${agencyId ? escapeHtml(String(agencyId)) : 'All'}<br/>
          Order Date: ${startDate || endDate 
            ? `From ${escapeHtml(startDate || 'Any')} To ${escapeHtml(endDate || 'Any')}`
            : 'All'}<br/>
        </div>
      </div>

      <table class="report">
        <thead>
          <tr>
            <th style="width:4%;" class="text-center">No</th>
            <th style="width:20%;" class="text-left">Product</th>
            <th style="width:14%;" class="text-left">Generic Name</th>
            <th style="width:9%;" class="text-center">Batch</th>
            <th style="width:9%;" class="text-center">Exp Date</th>
            <th style="width:12%;" class="text-left">Agency</th>
            <th style="width:8%;" class="text-right">Price</th>
            <th style="width:8%;" class="text-right">Sold Qty</th>
            <th style="width:6%;" class="text-right">FOC</th>
            <th style="width:10%;" class="text-right">Total Value</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="summary">
        <div>Total Products: <strong>${rows.length}</strong></div>
        <div>Total Sold Quantity: <strong>${totals.soldQty}</strong></div>
        <div>Total Free Quantity: <strong>${totals.freeQty}</strong></div>
        <div>Total Sales Value: <strong>${format(totals.amount)}</strong></div>
      </div>
    </div>

    <script>
      window.onload = function() {
        setTimeout(function() { window.print(); }, 400);
      };
      window.onafterprint = function() {
        try { window.location.href = '/product-report'; } catch (e) {}
      };
    </script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error("Error in getProductSalesReportPrintHtml:", err);
    res.status(500).send("<h1>Failed to generate product sales report</h1>");
  }
};
