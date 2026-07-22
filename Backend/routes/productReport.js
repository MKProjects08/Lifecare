const express = require("express");
const router = express.Router();
const productReportController = require("../controllers/productReportController");

router.get("/", productReportController.getProductSalesReport);
router.get("/print-html", productReportController.getProductSalesReportPrintHtml);
router.get("/excel", productReportController.getProductSalesReportExcel);

module.exports = router;
