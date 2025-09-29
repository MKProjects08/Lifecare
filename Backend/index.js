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
