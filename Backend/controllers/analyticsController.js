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

    res.json({
      todaySales: parseFloat(todaySales) || 0,
      monthSales: parseFloat(monthSales) || 0,
      totalCredits: parseFloat(totalCredits) || 0,
      pendingPayments: parseFloat(pendingPayments) || 0,
      ordersToday: parseInt(ordersToday) || 0,
      activeProducts: parseInt(activeProducts) || 0,
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
