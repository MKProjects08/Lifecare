const express = require("express");
const router = express.Router();
const productReportController = require("../controllers/productReportController");

router.get("/", productReportController.getProductSalesReport);

module.exports = router;
