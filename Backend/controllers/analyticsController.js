const db = require("../config/db");

// Helper to fill missing dates over last N days
function getLastNDates(n) {
  const dates = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

exports.getSalesLast10Days = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE(created_at) AS date, COALESCE(SUM(gross_total),0) AS total
       FROM Orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 9 DAY)
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`
    );

    const map = new Map(rows.map(r => [r.date.toISOString ? r.date.toISOString().slice(0,10) : String(r.date).slice(0,10), parseFloat(r.total) || 0]));
    const days = getLastNDates(10);
    const series = days.map(d => ({ date: d, total: map.get(d) || 0 }));

    res.json(series);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getSalesCurrentMonth = async (req, res) => {
  try {
    /* -------------------------------------------------
       1. Pull raw data for the current month only
       ------------------------------------------------- */
    const [rows] = await db.query(`
      SELECT 
        DATE(created_at)               AS date,
        COALESCE(SUM(gross_total), 0) AS total
      FROM Orders
      WHERE created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND created_at <  DATE_FORMAT(LAST_DAY(CURDATE()), '%Y-%m-%d') + INTERVAL 1 DAY
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    // Normalise to Map<YYYY-MM-DD, total>
    const map = new Map(
      rows.map(r => [
        r.date.toISOString().slice(0, 10),   // "2025-11-04"
        parseFloat(r.total) || 0,
      ])
    );

    /* -------------------------------------------------
       2. Build a full list of dates for the month
       ------------------------------------------------- */
    const now      = new Date();
    const year     = now.getFullYear();
    const month    = now.getMonth();                 // 0-based
    const firstDay = new Date(year, month, 1);       // 1st of month
    const lastDay  = new Date(year, month + 1, 0);   // last day of month

    const series = [];
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0, 10);
      series.push({ date: iso, total: map.get(iso) ?? 0 });
    }

    /* -------------------------------------------------
       3. Respond
       ------------------------------------------------- */
    res.json(series);
  } catch (err) {
    console.error('getSalesCurrentMonth error:', err);
    res.status(500).json({ error: err.message });
  }
};


// controllers/analyticsController.js
exports.getSalesByMonth = async (req, res) => {
  try {
    const { year, month } = req.query; // e.g. ?year=2025&month=11
    if (!year || !month) return res.status(400).json({ error: "year and month required" });

    const [rows] = await db.query(`
      SELECT 
        DATE(created_at) AS date,
        COALESCE(SUM(gross_total), 0) AS total
      FROM Orders
      WHERE YEAR(created_at) = ? AND MONTH(created_at) = ?
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `, [year, month]);

    const map = new Map(rows.map(r => [r.date.toISOString().slice(0,10), parseFloat(r.total) || 0]));

    const first = new Date(year, month - 1, 1);
    const last = new Date(year, month, 0);

    const series = [];
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().slice(0,10);
      series.push({ date: iso, total: map.get(iso) ?? 0 });
    }

    res.json(series);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getKpis = async (req, res) => {
  try {
    const [[{ todaySales }]] = await db.query(
      `SELECT COALESCE(SUM(gross_total),0) AS todaySales FROM Orders WHERE DATE(created_at)=CURDATE()`
    );
    const [[{ monthSales }]] = await db.query(
      `SELECT COALESCE(SUM(gross_total),0) AS monthSales FROM Orders WHERE YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE())`
    );
    const [[{ totalCredits }]] = await db.query(
      `SELECT COALESCE(SUM(credits),0) AS totalCredits FROM Customers`
    );
    const [[{ pendingPayments }]] = await db.query(
      `SELECT COALESCE(SUM(gross_total),0) AS pendingPayments FROM Orders WHERE LOWER(paymentstatus) <> 'paid'`
    );
    const [[{ ordersToday }]] = await db.query(
      `SELECT COUNT(*) AS ordersToday FROM Orders WHERE DATE(created_at)=CURDATE()`
    );
    const [[{ activeProducts }]] = await db.query(
      `SELECT COUNT(*) AS activeProducts FROM products WHERE is_active = 1`
    );
    const [[{ totalInventoryValue }]] = await db.query(
      `SELECT COALESCE(SUM(selling_price * quantity),0) AS totalInventoryValue FROM products WHERE is_active = 1`
    );

    res.json({
      todaySales: parseFloat(todaySales) || 0,
      monthSales: parseFloat(monthSales) || 0,
      totalCredits: parseFloat(totalCredits) || 0,
      pendingPayments: parseFloat(pendingPayments) || 0,
      ordersToday: parseInt(ordersToday) || 0,
      activeProducts: parseInt(activeProducts) || 0,
      totalInventoryValue: parseFloat(totalInventoryValue) || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const [rows] = await db.query(
      `SELECT 
         o.Order_ID,
         CONCAT('O', LPAD(o.Order_ID, 5, '0')) AS FormattedOrderID,
         o.gross_total,
         o.paymentstatus,
         o.created_at,
         c.pharmacyname AS CustomerName
       FROM Orders o
       LEFT JOIN Customers c ON o.Customer_ID = c.Customer_ID
       ORDER BY o.Order_ID DESC
       LIMIT ?`,
      [limit]
    );
    const normalized = rows.map(r => ({
      Order_ID: r.Order_ID,
      FormattedOrderID: r.FormattedOrderID,
      CustomerName: r.CustomerName || '-'
 ,     gross_total: parseFloat(r.gross_total) || 0,
      paymentstatus: r.paymentstatus,
      created_at: r.created_at,
    }));
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Printable HTML sales report with filters
exports.getSalesReportPrintHtml = async (req, res) => {
  try {
    const {
      customer = '',
      agency = '',
      user = '',
      paymentStatus = 'all',
      startDate = '',
      endDate = '',
      paidStartDate = '',
      paidEndDate = ''
    } = req.query;

    const where = [];
    const params = [];

    // Only orders that have been printed at least once
    where.push('o.print_count IS NOT NULL AND o.print_count > 0');

    if (customer) {
      where.push('o.Customer_ID = ?');
      params.push(customer);
    }
    if (agency) {
      where.push('o.Agency_ID = ?');
      params.push(agency);
    }
    if (user) {
      where.push('o.User_ID = ?');
      params.push(user);
    }
    if (paymentStatus && paymentStatus !== 'all') {
      where.push('LOWER(o.paymentstatus) = LOWER(?)');
      params.push(paymentStatus);
    }

    if (startDate) {
      where.push('DATE(o.created_at) >= ?');
      params.push(startDate);
    }
    if (endDate) {
      where.push('DATE(o.created_at) <= ?');
      params.push(endDate);
    }

    if (paidStartDate) {
      where.push('o.paid_date IS NOT NULL AND DATE(o.paid_date) >= ?');
      params.push(paidStartDate);
    }
    if (paidEndDate) {
      where.push('o.paid_date IS NOT NULL AND DATE(o.paid_date) <= ?');
      params.push(paidEndDate);
    }

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const [rows] = await db.query(
      `SELECT 
         o.Order_ID,
         CONCAT('O', LPAD(o.Order_ID, 5, '0')) AS FormattedOrderID,
         o.Customer_ID,
         o.Agency_ID,
         o.User_ID,
         o.created_at,
         o.paid_date,
         o.paymentstatus,
         o.gross_total,
         o.discount_amount,
         c.pharmacyname AS CustomerName,
         a.agencyname AS AgencyName,
         u.username AS UserName
       FROM Orders o
       LEFT JOIN Customers c ON o.Customer_ID = c.Customer_ID
       JOIN Agency a ON o.Agency_ID = a.Agency_ID
       JOIN Users u ON o.User_ID = u.User_ID
       ${whereSql}
       ORDER BY o.created_at ASC, o.Order_ID ASC`,
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
           <td colspan="8" style="text-align:center;padding:10px;border:1px solid #a3b8a5;color:#6b7280;">No sales match the selected filters</td>
         </tr>`
      : rows.map((r, idx) => `
          <tr>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:center;">${idx + 1}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.FormattedOrderID)}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.CustomerName || 'N/A')}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.AgencyName || 'N/A')}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(r.UserName || 'N/A')}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;">${escapeHtml(formatDate(r.created_at))}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:right;">${format(r.gross_total)}</td>
            <td style="border:1px solid #a3b8a5;padding:2px 4px;text-align:right;">${format(r.discount_amount)}</td>
          </tr>`).join('');

    const totals = rows.reduce((acc, r) => {
      acc.gross += parseFloat(r.gross_total) || 0;
      acc.discount += parseFloat(r.discount_amount) || 0;
      return acc;
    }, { gross: 0, discount: 0 });

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sales Report</title>
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

      .text-right { text-align: right; }
      .text-center { text-align: center; }

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
          <div class="sub">Sales Report</div>
        </div>
        <div class="meta">
          <div>Printed: ${escapeHtml(new Date().toLocaleString('en-GB'))}</div>
        </div>
      </div>

      <div style="font-size:10px;margin-bottom:5mm;">
        <strong>Filters:</strong>
        <div>
          Customer: ${customer ? escapeHtml(String(customer)) : 'All'}<br/>
          Agency: ${agency ? escapeHtml(String(agency)) : 'All'}<br/>
          User: ${user ? escapeHtml(String(user)) : 'All'}<br/>
          Payment Status: ${paymentStatus && paymentStatus !== 'all' ? escapeHtml(String(paymentStatus)) : 'All'}<br/>
          Order Date: ${startDate || endDate 
            ? `From ${escapeHtml(startDate || 'Any')} To ${escapeHtml(endDate || 'Any')}`
            : 'All'}<br/>
          Paid Date: ${paidStartDate || paidEndDate 
            ? `From ${escapeHtml(paidStartDate || 'Any')} To ${escapeHtml(paidEndDate || 'Any')}`
            : 'All'}
        </div>
      </div>

      <table class="report">
        <thead>
          <tr>
            <th style="width:4%;" class="text-center">No</th>
            <th style="width:10%;" class="text-left">Order ID</th>
            <th style="width:20%;" class="text-left">Customer</th>
            <th style="width:16%;" class="text-left">Agency</th>
            <th style="width:14%;" class="text-left">User</th>
            <th style="width:14%;" class="text-left">Order Date</th>
            <th style="width:11%;" class="text-right">Gross</th>
            <th style="width:11%;" class="text-right">Discount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="summary">
        <div>Total Orders: <strong>${rows.length}</strong></div>
        <div>Total Gross: <strong>${format(totals.gross)}</strong></div>
        <div>Total Discount: <strong>${format(totals.discount)}</strong></div>
      </div>
    </div>

    <script>
      window.onload = function() {
        setTimeout(function() { window.print(); }, 400);
      };
      window.onafterprint = function() {
        try { window.location.href = '/sales'; } catch (e) {}
      };
    </script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Error in getSalesReportPrintHtml:', err);
    res.status(500).send('<h1>Failed to generate sales report</h1>');
  }
};

exports.getTopCredits = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 50);
    const [rows] = await db.query(
      `SELECT Customer_ID, pharmacyname, credits 
       FROM Customers
       ORDER BY credits DESC
       LIMIT ?`,
      [limit]
    );
    const normalized = rows.map(r => ({
      Customer_ID: r.Customer_ID,
      pharmacyname: r.pharmacyname || `Customer ${r.Customer_ID}`,
      credits: parseFloat(r.credits) || 0,
    }));
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
