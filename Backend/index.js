const express = require("express");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/products");
const customerRoutes = require("./routes/customers");
const userRoutes = require("./routes/users");
const orderRoutes = require("./routes/orders");
const orderItemRoutes = require("./routes/orderItems");
const agencyRoutes = require("./routes/agencies"); // ✅ Import agency routes
const db = require("./config/db"); // MySQL connection

const app = express();
app.use(bodyParser.json());

// Mount routes
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/agencies", agencyRoutes); // ✅ Agency routes
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// ===================== Products API =====================
// GET     http://localhost:5000/api/products         -> Get all products
// GET     http://localhost:5000/api/products/:id     -> Get a single product
// POST    http://localhost:5000/api/products         -> Create a new product
// PUT     http://localhost:5000/api/products/:id     -> Update a product
// DELETE  http://localhost:5000/api/products/:id     -> Delete a product


// ===================== Customers API =====================
// GET     http://localhost:5000/api/customers        -> Get all customers
// GET     http://localhost:5000/api/customers/:id    -> Get a single customer
// POST    http://localhost:5000/api/customers        -> Create a new customer
// PUT     http://localhost:5000/api/customers/:id    -> Update a customer
// DELETE  http://localhost:5000/api/customers/:id    -> Delete a customer


// ===================== Users API =====================
// GET     http://localhost:5000/api/users            -> Get all users
// GET     http://localhost:5000/api/users/:id        -> Get a single user
// POST    http://localhost:5000/api/users            -> Create a new user
// PUT     http://localhost:5000/api/users/:id        -> Update a user
// DELETE  http://localhost:5000/api/users/:id        -> Delete a user


// ===================== Agency API =====================
// GET     http://localhost:5000/api/agencies          -> Get all agencies
// GET     http://localhost:5000/api/agencies/:id      -> Get a single agency
// POST    http://localhost:5000/api/agencies          -> Create a new agency
// PUT     http://localhost:5000/api/agencies/:id      -> Update an agency
// DELETE  http://localhost:5000/api/agencies/:id      -> Delete an agency


// ==========================
// Orders APIs
// ==========================

// Create a new order
// POST http://localhost:5000/api/orders

// Get all orders
// GET http://localhost:5000/api/orders

// Get a single order by ID
// GET http://localhost:5000/api/orders/:id

// Update an existing order
// PUT http://localhost:5000/api/orders/:id

// Delete an order
// DELETE http://localhost:5000/api/orders/:id


// ==========================
// OrderItems APIs
// ==========================

// Create a new order item
// POST http://localhost:5000/api/order-items

// Get all order items
// GET http://localhost:5000/api/order-items

// Get all items for a specific order
// GET http://localhost:5000/api/order-items/order/:orderId

// Update an existing order item
// PUT http://localhost:5000/api/order-items/:id

// Delete an order item
// DELETE http://localhost:5000/api/order-items/:id
