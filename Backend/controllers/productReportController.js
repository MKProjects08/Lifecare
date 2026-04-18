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
        oi.BatchNumber,
        p.expiry_date,
        p.selling_price,
        SUM(COALESCE(oi.quantity, 0)) AS sold_quantity,
        SUM(COALESCE(oi.free_issue_quantity, 0)) AS free_issue_quantity,
        COUNT(DISTINCT o.Order_ID) AS order_count,
        MAX(o.created_at) AS last_sale_date
      FROM OrderItem oi
      INNER JOIN Orders o ON o.Order_ID = oi.Order_ID
      LEFT JOIN products p
        ON p.Product_ID = oi.Product_ID
       AND p.BatchNumber = oi.BatchNumber
      ${whereClause}
      GROUP BY
        p.Product_ID,
        p.productname,
        oi.BatchNumber,
        p.expiry_date,
        p.selling_price
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
