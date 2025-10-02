const express = require("express");
const bodyParser = require("body-parser");
const productRoutes = require("./routes/products");
const customerRoutes = require("./routes/customers");
const userRoutes = require("./routes/users");
const db = require("../Backend/config/db"); 

const app = express();
app.use(bodyParser.json());

// Mount product routes
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/users", userRoutes);

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
