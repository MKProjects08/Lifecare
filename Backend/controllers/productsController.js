const db = require("../config/db"); // this is your mysql2/promise pool

// ✅ Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// ✅ Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM products WHERE BatchNumber = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ FIXED: Create new product
exports.createProduct = async (req, res) => {
  try {
    const { 
      productname, 
      generic_name, 
      BatchNumber, // ✅ ADD THIS
      quantity, 
      purchase_price, 
      selling_price, 
      expiry_date, 
      Agency_ID,
      is_active 
    } = req.body;

    console.log('Received data:', req.body); // Debug log

    // ✅ UPDATED SQL with BatchNumber
    const sql = `
      INSERT INTO products 
      (productname, generic_name, BatchNumber, quantity, purchase_price, selling_price, expiry_date, Agency_ID, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      productname, 
      generic_name, 
      BatchNumber, // ✅ ADD THIS
      quantity, 
      purchase_price, 
      selling_price, 
      expiry_date, 
      Agency_ID,
      is_active || 1 // ✅ ADD THIS
    ];

    console.log('Executing SQL with values:', values); // Debug log

    const [result] = await db.query(sql, values);
    res.status(201).json({ 
      message: "Product created successfully", 
      productId: result.insertId 
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productname, generic_name, quantity, purchase_price, selling_price, expiry_date, Agency_ID, is_active } = req.body;
    const sql = `
      UPDATE products 
      SET productname=?, generic_name=?, quantity=?, purchase_price=?, selling_price=?, expiry_date=?, Agency_ID=?, is_active=? 
      WHERE BatchNumber=?
    `;
    const [result] = await db.query(sql, [productname, generic_name, quantity, purchase_price, selling_price, expiry_date, Agency_ID, is_active !== undefined ? is_active : 1, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/// ✅ Soft delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "UPDATE Products SET is_active = FALSE WHERE BatchNumber = ?",
      [id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product marked as inactive (soft deleted) successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Printable HTML product inventory report with filters
exports.getProductsReportPrintHtml = async (req, res) => {
  try {
    const {
      agency = '',
      productName = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const where = ['p.is_active = 1'];
    const params = [];

    if (agency) {
      // Match by agency name (case-insensitive contains)
      where.push('LOWER(a.agencyname) LIKE LOWER(?)');
      params.push('%' + agency + '%');
    }

    if (productName) {
      where.push('LOWER(p.productname) LIKE LOWER(?)');
      params.push('%' + productName + '%');
    }

    if (startDate) {
      where.push('DATE(p.created_at) >= ?');
      params.push(startDate);
    }
    if (endDate) {
      where.push('DATE(p.created_at) <= ?');
      params.push(endDate);
    }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await db.query(
      `SELECT 
         p.Product_ID,
         p.BatchNumber,
         p.productname,
         p.generic_name,
         p.quantity,
         p.expiry_date,
         p.selling_price,
         p.created_at,
         p.Agency_ID,
         a.agencyname AS AgencyName
       FROM products p
       LEFT JOIN Agency a ON p.Agency_ID = a.Agency_ID
       ${whereSql}
       ORDER BY p.productname ASC, p.BatchNumber ASC`,
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
           <td colspan="9" style="text-align:center;padding:10px;border:1px solid #a3b8a5;color:#6b7280;">No products match the selected filters</td>
         </tr>`
      : rows.map((r, idx) => {
          const qty = parseFloat(r.quantity) || 0;
          const rate = parseFloat(r.selling_price) || 0;
          const value = qty * rate;
          return `
            <tr>
              <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:center;">${idx + 1}</td>
              <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.BatchNumber || '')}</td>
              <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.productname || '')}</td>
              <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.generic_name || '')}</td>
              <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:right;">${qty}</td>
              <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(formatDate(r.expiry_date))}</td>
              <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.AgencyName || '')}</td>
              <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:right;">${format(rate)}</td>
              <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:right;">${format(value)}</td>
            </tr>`;
        }).join('');

    const totals = rows.reduce((acc, r) => {
      const qty = parseFloat(r.quantity) || 0;
      const rate = parseFloat(r.selling_price) || 0;
      acc.qty += qty;
      acc.value += qty * rate;
      return acc;
    }, { qty: 0, value: 0 });

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Product Inventory Report</title>
    <style>
      @media print {
        @page {
          margin: 0.7cm;
          size: A4;
        }
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }

      body {
        font-family: Arial, Helvetica, sans-serif;
        background: #e3f0e8;
        font-size: 11px;
      }

      .page {
        width: 19.5cm;
        min-height: 27.5cm;
        margin: 0 auto;
        background: #f8fff9;
        border: 1px solid #a3b8a5;
        padding: 10mm;
        box-sizing: border-box;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 6mm;
      }

      .title {
        font-size: 15px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .sub {
        font-size: 10px;
        margin-top: 2px;
      }

      .meta {
        font-size: 10px;
        text-align: right;
      }

      table.report {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }

      table.report th,
      table.report td {
        border: 1px solid #a3b8a5;
        padding: 2px 4px;
      }

      table.report th {
        background: #d7e7db;
        font-weight: 700;
      }

      .summary {
        margin-top: 4mm;
        font-size: 10px;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header">
        <div>
          <div class="title">Life Care Distribution</div>
          <div class="sub">Product Inventory Report</div>
        </div>
        <div class="meta">
          <div>Printed: ${escapeHtml(new Date().toLocaleString('en-GB'))}</div>
        </div>
      </div>

      <div style="font-size:10px;margin-bottom:5mm;">
        <strong>Filters:</strong>
        <div>
          Agency: ${agency ? escapeHtml(String(agency)) : 'All'}<br/>
          Product: ${productName ? escapeHtml(String(productName)) : 'All'}<br/>
          Date: ${startDate || endDate 
            ? `From ${escapeHtml(startDate || 'Any')} To ${escapeHtml(endDate || 'Any')}`
            : 'All'}
        </div>
      </div>

      <table class="report">
        <thead>
          <tr>
            <th style="width:4%;">No</th>
            <th style="width:12%;">Batch</th>
            <th style="width:24%;">Product Name</th>
            <th style="width:16%;">Generic Name</th>
            <th style="width:8%;">Qty</th>
            <th style="width:10%;">Expiry</th>
            <th style="width:14%;">Agency</th>
            <th style="width:6%;">Rate</th>
            <th style="width:6%;">Value</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="summary">
        <div>Total Products: <strong>${rows.length}</strong></div>
        <div>Total Quantity: <strong>${totals.qty}</strong></div>
        <div>Total Stock Value: <strong>${format(totals.value)}</strong></div>
      </div>
    </div>

    <script>
      window.onload = function() {
        setTimeout(function() { window.print(); }, 400);
      };
      window.onafterprint = function() {
        try { window.location.href = '/products'; } catch (e) {}
      };
    </script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Error in getProductsReportPrintHtml:', err);
    res.status(500).send('<h1>Failed to generate products report</h1>');
  }
};
