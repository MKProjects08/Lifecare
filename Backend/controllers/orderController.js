// orderController.js - CORRECTED VERSION
const db = require("../config/db");

// ✅ Get all orders (user-friendly)
exports.getAllOrders = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        o.Order_ID,
        CONCAT('O', LPAD(o.Order_ID, 5, '0')) AS FormattedOrderID,
        o.Customer_ID,
        o.Agency_ID,
        o.User_ID,
        o.paid_date,
        o.paymentstatus,
        o.print_count,
        o.gross_total,
        o.net_total,
        o.discount_amount,
        o.created_at,
        c.pharmacyname AS CustomerName,
        a.agencyname AS AgencyName,
        u.username AS UserName
      FROM Orders o
      LEFT JOIN Customers c ON o.Customer_ID = c.Customer_ID
      JOIN Agency a ON o.Agency_ID = a.Agency_ID
      JOIN Users u ON o.User_ID = u.User_ID
      ORDER BY o.Order_ID DESC
    `);

    // Convert DECIMAL strings to numbers
    const formattedRows = rows.map(r => ({
      ...r,
      gross_total: parseFloat(r.gross_total) || 0,
      net_total: parseFloat(r.net_total) || 0,
      discount_amount: parseFloat(r.discount_amount) || 0
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error('Error in getAllOrders:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get order by ID - FIXED: Use Order_ID instead of id
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT 
        o.*,
        CONCAT('O', LPAD(o.Order_ID, 5, '0')) AS FormattedOrderID,
        c.pharmacyname AS CustomerName,
        a.agencyname AS AgencyName,
        u.username AS UserName
      FROM Orders o
      LEFT JOIN Customers c ON o.Customer_ID = c.Customer_ID
      JOIN Agency a ON o.Agency_ID = a.Agency_ID
      JOIN Users u ON o.User_ID = u.User_ID
      WHERE o.Order_ID = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Fetch order items with product details
    const [itemRows] = await db.query(
      `SELECT 
         oi.Product_ID AS productId,
         oi.BatchNumber AS batchNumber,
         oi.quantity,
         oi.free_issue_quantity,
         p.productname AS productName,
         p.expiry_date AS expiryDate,
         p.selling_price AS rate
       FROM OrderItem oi
       LEFT JOIN products p ON p.BatchNumber = oi.BatchNumber
       WHERE oi.Order_ID = ?`,
      [id]
    );

    const order = rows[0];
    order.items = Array.isArray(itemRows) ? itemRows : [];

    res.json(order);
  } catch (err) {
    console.error('Error in getOrderById:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create new order (single order) - FIXED
exports.createOrder = async (req, res) => {
  try {
    const { 
      Customer_ID, 
      Agency_ID, 
      User_ID, 
      paid_date, 
      paymentstatus, 
      print_count, 
      gross_total, 
      net_total, 
      discount_amount 
    } = req.body;

    // Validate required fields
    if (!Agency_ID || !User_ID || gross_total === undefined || net_total === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: Agency_ID, User_ID, gross_total, net_total are required' 
      });
    }

    const sql = `
      INSERT INTO Orders 
      (Customer_ID, Agency_ID, User_ID, paid_date, paymentstatus, print_count, gross_total, net_total, discount_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [
      Customer_ID || null,
      Agency_ID,
      User_ID,
      paid_date || null,
      paymentstatus || 'paid',
      print_count || 0,
      parseFloat(gross_total) || 0,
      parseFloat(net_total) || 0,
      parseFloat(discount_amount) || 0
    ]);

    res.status(201).json({ 
      message: "Order created successfully", 
      orderId: result.insertId 
    });
  } catch (err) {
    console.error('Error in createOrder:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Create order with items - FIXED AND IMPROVED
exports.createOrderWithItems = async (req, res) => {
  console.log("createOrderWithItems called");
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      Customer_ID,
      Agency_ID,
      User_ID,
      paid_date,
      paymentstatus = 'paid',
      print_count = 0,
      gross_total,
      net_total,
      discount_amount = 0,
      items // Array of order items
    } = req.body;

    // Validate required fields
    if (!Agency_ID || !User_ID) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Missing required fields: Agency_ID and User_ID are required' 
      });
    }

    if (gross_total === undefined || net_total === undefined) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Missing required fields: gross_total and net_total are required' 
      });
    }

    // Validate items array
    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'At least one order item is required' 
      });
    }

    // 1. Insert into Orders table
    const orderSql = `
      INSERT INTO Orders 
      (Customer_ID, Agency_ID, User_ID, paid_date, paymentstatus, print_count, gross_total, net_total, discount_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [orderResult] = await connection.query(orderSql, [
      Customer_ID || null,
      Agency_ID,
      User_ID,
      paid_date || null,
      paymentstatus,
      print_count,
      parseFloat(gross_total) || 0,
      parseFloat(net_total) || 0,
      parseFloat(discount_amount) || 0
    ]);
console.log("orderSql executed");
    const orderId = orderResult.insertId;

    // 2. Insert into OrderItem table for each item
    let itemsCount = 0;
    const itemSql = `
      INSERT INTO OrderItem 
      (Order_ID, Product_ID, BatchNumber, quantity, free_issue_quantity)
      VALUES (?, ?, ?, ?, ?)
    `;

    for (const item of items) {
      // Validate item fields
      if (!item.productId || !item.batchNumber || item.quantity === undefined) {
        throw new Error(`Invalid item data: productId, batchNumber, and quantity are required for item ${itemsCount + 1}`);
      }

      // Validate quantity is positive
      if (item.quantity <= 0) {
        throw new Error(`Invalid quantity for item ${itemsCount + 1}: quantity must be greater than 0`);
      }

      // Calculate total to deduct (ordered + free items)
      const orderedQty = parseInt(item.quantity) || 0;
      const freeQty = parseInt(item.free_issue_quantity) || 0;
      const totalToDeduct = orderedQty + freeQty;

      // 2.1 Check current stock and lock the row to prevent race conditions
      const [stockRows] = await connection.query(
        `SELECT quantity FROM products WHERE BatchNumber = ? FOR UPDATE`,
        [item.batchNumber]
      );

      if (!stockRows || stockRows.length === 0) {
        throw new Error(`Product with batch ${item.batchNumber} not found`);
      }

      const currentQty = parseInt(stockRows[0].quantity) || 0;
      if (currentQty < totalToDeduct) {
        throw new Error(`Insufficient stock for batch ${item.batchNumber}. Available: ${currentQty}, required: ${totalToDeduct}`);
      }

      // 2.2 Insert order item
      await connection.query(itemSql, [
        orderId,
        item.productId,
        item.batchNumber,
        orderedQty,
        freeQty
      ]);

      // 2.3 Deduct inventory
      await connection.query(
        `UPDATE products SET quantity = quantity - ? WHERE BatchNumber = ?`,
        [totalToDeduct, item.batchNumber]
      );
      
      itemsCount++;
    }
console.log("All items inserted");
    // Commit transaction
    await connection.commit();
    
    res.status(201).json({
      message: "Order created successfully",
      orderId: orderId,
      itemsCount: itemsCount,
      formattedOrderId: `O${String(orderId).padStart(5, '0')}`
    });

  } catch (err) {
    await connection.rollback();
    console.error('Error creating order with items:', err);
    res.status(500).json({ 
      error: err.message,
      details: "Failed to create order and items"
    });
  } finally {
    connection.release();
  }
};

// ✅ Update order - FIXED: Use Order_ID instead of id
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      Customer_ID, 
      Agency_ID, 
      User_ID, 
      paid_date, 
      paymentstatus, 
      print_count, 
      gross_total, 
      net_total, 
      discount_amount 
    } = req.body;

    // Validate required fields
    if (!Agency_ID || !User_ID || gross_total === undefined || net_total === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: Agency_ID, User_ID, gross_total, net_total are required' 
      });
    }

    const sql = `
      UPDATE Orders
      SET Customer_ID=?, Agency_ID=?, User_ID=?, paid_date=?, paymentstatus=?, 
          print_count=?, gross_total=?, net_total=?, discount_amount=?
      WHERE Order_ID=?
    `;
    
    const [result] = await db.query(sql, [
      Customer_ID || null,
      Agency_ID,
      User_ID,
      paid_date || null,
      paymentstatus || 'paid',
      print_count || 0,
      parseFloat(gross_total) || 0,
      parseFloat(net_total) || 0,
      parseFloat(discount_amount) || 0,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated successfully" });
  } catch (err) {
    console.error('Error in updateOrder:', err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete order - FIXED: Use Order_ID instead of id
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use DELETE with WHERE Order_ID
    const [result] = await db.query("DELETE FROM Orders WHERE Order_ID = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error('Error in deleteOrder:', err);
    res.status(500).json({ error: err.message });
  }
};