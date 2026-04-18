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
       LEFT JOIN products p ON p.Product_ID = oi.Product_ID AND p.BatchNumber = oi.BatchNumber
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

// ✅ Get printable HTML invoice for an order
exports.getOrderPrintHtml = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(`
      SELECT 
        o.*,
        CONCAT('O', LPAD(o.Order_ID, 5, '0')) AS FormattedOrderID,
        c.pharmacyname AS CustomerName,
        c.address AS CustomerAddress,
        a.agencyname AS AgencyName,
        u.username AS UserName
      FROM Orders o
      LEFT JOIN Customers c ON o.Customer_ID = c.Customer_ID
      JOIN Agency a ON o.Agency_ID = a.Agency_ID
      JOIN Users u ON o.User_ID = u.User_ID
      WHERE o.Order_ID = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).send("<h1>Order not found</h1>");
    }

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
       LEFT JOIN products p ON p.Product_ID = oi.Product_ID AND p.BatchNumber = oi.BatchNumber
       WHERE oi.Order_ID = ?`,
      [id]
    );

    const order = rows[0];
    const items = Array.isArray(itemRows) ? itemRows : [];

    const grossTotal = parseFloat(order.gross_total) || 0;
    const discountAmount = parseFloat(order.discount_amount) || 0;
    const finalTotal = grossTotal - discountAmount;

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

    const escapeHtml = (str) => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const rowsHtml = items.length === 0
      ? `<tr>
           <td colspan="8" style="text-align:center;padding:20px;border:1px solid #d1d5db;color:#6b7280;">
             No items found in this order
           </td>
         </tr>`
      : items.map((item, idx) => {
          const qty = Number(item.quantity) || 0;
          const foc = Number(item.free_issue_quantity) || 0;
          const rate = Number(item.rate) || 0;
          const amount = qty * rate;
          return `
            <tr style="border-bottom:1px solid #d1d5db;">
              <td style="padding:8px 12px;text-align:center;font-weight:600;border-right:1px solid #374151;width:5%;">${idx + 1}</td>
              <td style="padding:8px 12px;border-right:1px solid #374151;width:32%;">
                ${escapeHtml(item.productName || item.product_name || item.productId || '-')}
              </td>
              <td style="padding:8px 8px;text-align:center;border-right:1px solid #374151;width:12%;">
                ${escapeHtml(item.batchNumber || item.batch_number || '-')}
              </td>
              <td style="padding:8px 8px;text-align:center;border-right:1px solid #374151;width:11%;">
                ${escapeHtml(formatDate(item.expiryDate || item.expiry_date))}
              </td>
              <td style="padding:8px 8px;text-align:center;border-right:1px solid #374151;width:8%;">${qty}</td>
              <td style="padding:8px 8px;text-align:center;border-right:1px solid #374151;width:8%;">${foc > 0 ? foc : '-'}</td>
              <td style="padding:8px 12px;text-align:right;border-right:1px solid #374151;width:12%;">${format(rate)}</td>
              <td style="padding:8px 12px;text-align:right;width:12%;">${format(amount)}</td>
            </tr>`;
        }).join('');

    const isOriginal = (order.print_count || 0) === 0;
    const printBadgeText = isOriginal ? 'ORIGINAL' : `COPY #${order.print_count}`;
    const paymentStatus = order.paymentstatus || 'Pending';
    const isPaid = String(paymentStatus).toLowerCase() === 'paid';

    const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Invoice ${escapeHtml(order.FormattedOrderID || order.Order_ID)}</title>
    <style>
      @media print {
        @page {
          margin: 1cm 1cm 1cm 1cm;
          size: A4 portrait;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .page {
          margin: 0 !important;
          padding: 8mm 10mm !important;
          width: 100% !important;
        }
      }

      body {
        font-family: Arial, Helvetica, sans-serif;
        background: #ffffff;
        font-size: 18px;
        color: #111827;
        line-height: 1.25;
        margin: 0;
        padding: 0;
      }

      .page {
        width: 19.5cm;
        min-height: 27.5cm;
        margin: 0 auto;
        background: #ffffff;
        border: none;
        padding: 10mm 10mm 8mm 10mm;
        box-sizing: border-box;
      }

      .header-row {
        text-align: center;
        margin-bottom: 8mm;
      }

      .header-title {
        font-size: 22px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .header-sub {
        margin-top: 2px;
        font-size: 14px;
      }

      .invoice-customer-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 6mm;
        gap: 10mm;
      }

      .invoice-info {
        flex: 1;
        font-size: 14px;
      }

      .customer-info {
        flex: 1;
        font-size: 12px;
      }

      .badge {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 3px;
        border: 1px solid #9ca3af;
        font-size: 14px;
        font-weight: 700;
        margin-top: 2mm;
        background: transparent;
      }

      .section-box {
        border: 1px solid #e5e7eb;
        padding: 8px 10px;
        margin-bottom: 6mm;
      }

      .section-title {
        font-weight: 700;
        margin-bottom: 2px;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        column-gap: 10mm;
        row-gap: 1mm;
        font-size: 13px;
      }

      .meta-label {
        font-weight: 600;
        min-width: 28mm;
        display: inline-block;
      }

      table.invoice-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #e5e7eb;
        font-size: 15px;
      }

      table.invoice-table th,
      table.invoice-table td {
        border: 1px solid #e5e7eb;
        padding: 10px 12px;
        text-align: center;
        vertical-align: middle;
        word-wrap: break-word;
      }

      table.invoice-table th {
        background: #ffffff;
        font-weight: 700;
      }

      .text-left { text-align: left; }
      .text-right { text-align: right; }

      .summary-row {
        margin-top: 3mm;
        display: flex;
        justify-content: space-between;
        font-size: 13px;
      }

      .summary-left {
        width: 40%;
      }

      .summary-right {
        width: 45%;
      }

      .summary-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }

      .summary-table td {
        padding: 8px 10px;
        border: 1px solid #e5e7eb;
        font-size: 14px; /* moderate label text */
      }

      .summary-table td.text-right {
        font-weight: 700;
        font-size: 16px; /* emphasized amounts, but not too large */
      }

      .footer-row {
        margin-top: 50mm;
        display: flex;
        justify-content: space-between;
        font-size: 10px;
      }

      .signature-box {
        width: 48%;
      }

      .signature-line {
        margin-top: 16mm;
        border-bottom: 1px solid #111827;
      }

      .bottom-note {
        margin-top: 6mm;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
      }

      .back-button {
        margin-top: 3mm;
        padding: 3px 10px;
        font-size: 9px;
        font-weight: 600;
        border-radius: 999px;
        border: 1px solid #9ca3af;
        background: #ffffff;
        color: #374151;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="header-row">
        <div class="header-title">Life Care Pharmacy</div>
        <div class="header-sub">Pharmaceutical Distribution Services</div>
        <div class="header-sub">Life Care Pharmacy, K.k.s Road, Maviddapuram, Jaffna</div>
        <div class="header-sub">Tel: 0764671013 (Distribution & Pharmacy)</div>
      </div>

      <div class="invoice-customer-row">
        <div class="invoice-info">
          <div><strong>Invoice No:</strong> ${escapeHtml(order.FormattedOrderID || order.Order_ID)}</div>
          <div><strong>Date:</strong> ${escapeHtml(formatDate(order.created_at || order.order_date))}</div>
          <div class="badge">${printBadgeText}</div>
        </div>
        <div class="customer-info section-box">
          <div class="section-title">Customer</div>
          <div style="font-size:14px;font-weight:600;">${escapeHtml(order.CustomerName || order.customer_name || 'N/A')}</div>
          <div style="margin-top:2px;color:#374151;font-size:13px;">${escapeHtml(order.CustomerAddress || order.customer_address || '')}</div>
        </div>
      </div>

      <div class="meta-grid section-box" style="margin-bottom:5mm;">
        <div>
          <span class="meta-label">Order ID:</span>
          <span>${escapeHtml(String(order.Order_ID || ''))}</span>
        </div>
        <div>
          <span class="meta-label">User:</span>
          <span>${escapeHtml(order.UserName || '')}</span>
        </div>
        <div>
          <span class="meta-label">Agency:</span>
          <span>${escapeHtml(order.AgencyName || '')}</span>
        </div>
      </div>

      <table class="invoice-table">
        <thead>
          <tr>
            <th style="width:4%;">No</th>
            <th class="text-left" style="width:26%;">Description</th>
            <th style="width:9%;">Batch</th>
            <th style="width:8%;">Exp</th>
            <th style="width:8%;">Qty</th>
            <th style="width:7%;">FOC</th>
            <th style="width:9%;">Rate</th>
            <th style="width:10%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="summary-row">
        <div class="summary-left">
          <div>Total Items: <strong>${items.length}</strong></div>
        </div>
        <div class="summary-right">
          <table class="summary-table">
            <tbody>
              <tr>
                <td class="text-left">Gross Amount</td>
                <td class="text-right">${format(grossTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="footer-row">
        <div class="signature-box">
          <div><strong>Customer Signature</strong></div>
          <div class="signature-line"></div>
        </div>
        <div class="signature-box" style="text-align:center;">
          <div style="font-size:16px;"><strong>45 Days Credit Only</strong></div>
        </div>
        <div class="signature-box" style="text-align:right;">
          <div><strong>Authorized Signature</strong></div>
          <div class="signature-line"></div>
        </div>
      </div>

      <div class="bottom-note">
        <div>Thank you for your business!</div>
        <div>This is a computer-generated invoice by Life Care Distribution </div>
        <div>Powered by MK Projects (0778146469) © 2025</div>
      </div>
    </div>

    <script>
      (function() {
        if (window.__printHandled) return;
        window.__printHandled = true;

        function doPrint() {
          try {
            window.print();
          } catch (e) {
            console.error('Print failed', e);
          }
        }

        // Give browser a short time to render the written document
        setTimeout(doPrint, 400);

        // Redirect to orders page once print completes (one-time)
        window.onafterprint = function() {
          if (window.__afterPrintDone) return;
          window.__afterPrintDone = true;
          try { window.location.href = '/orders'; } catch (e) { console.error(e); }
        };
      })();
    </script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('Error in getOrderPrintHtml:', err);
    res.status(500).send('<h1>Failed to generate invoice</h1>');
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

// ✅ Update order - transactional and adjust customer credits when needed
exports.updateOrder = async (req, res) => {
  const connection = await db.getConnection();
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
      discount_amount,
    } = req.body;

    // Validate required fields
    if (!Agency_ID || !User_ID || gross_total === undefined || net_total === undefined) {
      await connection.rollback?.();
      return res.status(400).json({
        error: 'Missing required fields: Agency_ID, User_ID, gross_total, net_total are required',
      });
    }

    await connection.beginTransaction();

    // 1) Read existing order state
    const [existingRows] = await connection.query(
      `SELECT Order_ID, Customer_ID AS ExistingCustomer_ID, paymentstatus AS ExistingStatus, print_count AS ExistingPrintCount, gross_total AS ExistingGross
       FROM Orders WHERE Order_ID = ? FOR UPDATE`,
      [id]
    );

    if (!existingRows || existingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    const existing = existingRows[0];
    const prevPrintCount = parseInt(existing.ExistingPrintCount) || 0;
    const prevStatus = existing.ExistingStatus || 'pending';
    const prevCustomerId = existing.ExistingCustomer_ID;
    const orderGross = parseFloat(gross_total) || 0;

    // 2) Update order
    const updateSql = `
      UPDATE Orders
      SET Customer_ID=?, Agency_ID=?, User_ID=?, paid_date=?, paymentstatus=?,
          print_count=?, gross_total=?, net_total=?, discount_amount=?
      WHERE Order_ID=?
    `;

    const [result] = await connection.query(updateSql, [
      Customer_ID || null,
      Agency_ID,
      User_ID,
      paid_date || null,
      paymentstatus || 'paid',
      print_count || 0,
      parseFloat(gross_total) || 0,
      parseFloat(net_total) || 0,
      parseFloat(discount_amount) || 0,
      id,
    ]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    // 3) Adjust customer credits and agency sales if applicable
    // We apply rules against the previous state:
    // - If print_count increased from 0 to >0 (first print), add gross_total to customer's credits
    // - If paymentstatus changed from not paid to paid, deduct gross_total from customer's credits
    const newPrintCount = parseInt(print_count) || 0;
    const newStatus = paymentstatus || 'paid';
    const effectiveCustomerId = Customer_ID || prevCustomerId;
    const effectiveAgencyId = Agency_ID;

    // Add on first print: customer credits and agency sales
    if (prevPrintCount === 0 && newPrintCount > 0 && orderGross > 0) {
      if (effectiveCustomerId) {
      await connection.query(
        `UPDATE Customers SET credits = credits + ? WHERE Customer_ID = ?`,
        [orderGross, effectiveCustomerId]
      );
      }
      if (effectiveAgencyId) {
        await connection.query(
          `UPDATE Agency SET sales = COALESCE(sales, 0) + ? WHERE Agency_ID = ?`,
          [orderGross, effectiveAgencyId]
        );
      }
    }

    // Deduct on status change to paid
    const wasPaid = String(prevStatus).toLowerCase() === 'paid';
    const nowPaid = String(newStatus).toLowerCase() === 'paid';
    if (!wasPaid && nowPaid && effectiveCustomerId && orderGross > 0) {
      await connection.query(
        `UPDATE Customers SET credits = credits - ? WHERE Customer_ID = ?`,
        [orderGross, effectiveCustomerId]
      );
    }

    await connection.commit();
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    try { await connection.rollback(); } catch {}
    console.error('Error in updateOrder:', err);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
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